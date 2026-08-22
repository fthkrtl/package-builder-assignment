<?php

namespace Tests\Feature;

use App\Models\Package;
use Database\Seeders\SeedDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The handful of tests the brief asks for, aimed at the two places it names:
 * publish validation and the published lock.
 *
 * TODO(fatih): bodies are yours. Each name says what it has to prove.
 */
class PackageApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SeedDataSeeder::class);
    }

    /** A draft may be saved with almost nothing filled in. */
    public function test_a_draft_can_be_created_with_partial_data(): void
    {
        $this->markTestIncomplete();
    }

    /** Publishing without inclusions fails, and says so under the `inclusions` key. */
    public function test_publish_requires_at_least_one_inclusion(): void
    {
        $this->markTestIncomplete();
    }

    /** The travel window has to start today or later. */
    public function test_publish_rejects_a_start_date_in_the_past(): void
    {
        $this->markTestIncomplete();
    }

    /** A complete draft publishes and comes back with the new status. */
    public function test_a_complete_draft_can_be_published(): void
    {
        $this->markTestIncomplete();
    }

    /** Published is final: no edits, no re-publish. */
    public function test_a_published_package_cannot_be_edited(): void
    {
        $this->markTestIncomplete();
    }

    /** Handy while writing the tests above. */
    private function draft(array $attributes = []): Package
    {
        return Package::create($attributes);
    }
}
