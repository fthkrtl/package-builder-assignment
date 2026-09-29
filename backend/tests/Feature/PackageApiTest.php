<?php

namespace Tests\Feature;

use App\Enums\PackageStatus;
use App\Models\Package;
use Database\Seeders\SeedDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The rules under test are the ones the brief states: a title of 5–100
 * characters, a price above zero, a travel window that starts today or later
 * and ends after it starts, at least one inclusion, and no edits once published.
 */
class PackageApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SeedDataSeeder::class);
    }

    public function test_a_draft_can_be_created_with_partial_data(): void
    {
        $this->postJson('/api/packages', ['title' => 'Only a title'])
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.title', 'Only a title')
            ->assertJsonPath('data.price', null);

        $this->assertDatabaseCount('packages', 1);
    }

    public function test_a_draft_stores_an_optional_subtitle_of_at_most_255_characters(): void
    {
        $this->postJson('/api/packages', ['title' => 'Only a title', 'subtitle' => 'Seven nights on the bay'])
            ->assertCreated()
            ->assertJsonPath('data.subtitle', 'Seven nights on the bay');

        $this->postJson('/api/packages', ['subtitle' => str_repeat('a', 256)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('subtitle');
    }

    public function test_publish_requires_at_least_one_inclusion(): void
    {
        $package = $this->completeDraft(['inclusions' => []]);

        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['inclusions'])
            ->assertJsonPath('errors.inclusions.0', 'At least one inclusion is required.');

        $this->assertSame(PackageStatus::Draft, $package->fresh()->status);
    }

    public function test_publish_rejects_a_start_date_in_the_past(): void
    {
        $package = $this->completeDraft([
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
        ]);

        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);

        $this->assertSame(PackageStatus::Draft, $package->fresh()->status);
    }

    public function test_publish_reports_every_unmet_rule_at_once(): void
    {
        $package = Package::create(['title' => 'Only a title']);

        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'property_id', 'price', 'start_date', 'end_date', 'inclusions',
            ]);
    }

    public function test_a_complete_draft_can_be_published(): void
    {
        $package = $this->completeDraft();

        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertOk()
            ->assertJsonPath('data.status', 'published');

        $published = $package->fresh();
        $this->assertSame(PackageStatus::Published, $published->status);
        $this->assertNotNull($published->published_at);
    }

    public function test_a_published_package_cannot_be_edited(): void
    {
        $package = $this->completeDraft();
        $this->postJson("/api/packages/{$package->id}/publish")->assertOk();

        $this->patchJson("/api/packages/{$package->id}", ['title' => 'Changed after publish'])
            ->assertStatus(409);

        // Publishing is final in both directions: no second publish either.
        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertStatus(409);

        $this->assertSame('Aegean Slow Week', $package->fresh()->title);
    }

    /** A draft that satisfies every publish rule, unless a caller overrides one. */
    private function completeDraft(array $attributes = []): Package
    {
        $inclusions = $attributes['inclusions'] ?? [1, 9];
        unset($attributes['inclusions']);

        $package = Package::create(array_merge([
            'property_id' => 1,
            'title' => 'Aegean Slow Week',
            'description' => 'Seven nights on the bay.',
            'price' => 1240,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(17)->toDateString(),
        ], $attributes));

        $package->inclusions()->sync($inclusions);

        return $package;
    }
}
