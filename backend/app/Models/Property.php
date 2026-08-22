<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = ['name', 'location', 'nightly_rate'];

    protected function casts(): array
    {
        return ['nightly_rate' => 'integer'];
    }

    /** Server-side search used by step 1 of the wizard. */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        $like = '%'.str_replace('%', '\%', $term).'%';

        return $query->where(fn (Builder $q) => $q
            ->where('name', 'like', $like)
            ->orWhere('location', 'like', $like));
    }
}
