<?php

use App\Http\Controllers\Api\InclusionController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PropertyController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('properties', [PropertyController::class, 'index']);
Route::get('inclusions', [InclusionController::class, 'index']);

Route::get('packages', [PackageController::class, 'index']);
Route::post('packages', [PackageController::class, 'store']);
Route::get('packages/{package}', [PackageController::class, 'show']);
Route::patch('packages/{package}', [PackageController::class, 'update']);
Route::post('packages/{package}/publish', [PackageController::class, 'publish']);

// Reviewer convenience: drop back to the shipped seed data. Never outside local.
Route::post('dev/reset', function () {
    abort_unless(app()->environment('local', 'testing'), 404);

    Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);

    return response()->noContent();
})->name('dev.reset');
