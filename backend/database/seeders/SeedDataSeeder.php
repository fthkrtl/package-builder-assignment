<?php

namespace Database\Seeders;

use App\Models\Inclusion;
use App\Models\Property;
use Illuminate\Database\Seeder;

/**
 * Loads the fixture shipped with the assignment verbatim, keyed by the ids it
 * defines so the API and the brief talk about the same records.
 */
class SeedDataSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(database_path('data/seed.json')), true, flags: JSON_THROW_ON_ERROR);

        foreach ($data['properties'] as $property) {
            Property::updateOrCreate(['id' => $property['id']], $property);
        }

        foreach ($data['inclusions'] as $inclusion) {
            Inclusion::updateOrCreate(['id' => $inclusion['id']], $inclusion);
        }
    }
}
