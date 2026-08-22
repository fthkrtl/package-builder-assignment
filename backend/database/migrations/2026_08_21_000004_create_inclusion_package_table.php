<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inclusion_package', function (Blueprint $table) {
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inclusion_id')->constrained()->cascadeOnDelete();
            $table->primary(['package_id', 'inclusion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inclusion_package');
    }
};
