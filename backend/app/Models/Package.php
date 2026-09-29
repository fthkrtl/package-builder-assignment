<?php

namespace App\Models;

use App\Enums\PackageStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Package extends Model
{
    /** A package starts life as a draft; the DB default mirrors this. */
    protected $attributes = ['status' => PackageStatus::Draft->value];

    protected $fillable = [
        'property_id', 'title', 'subtitle', 'description', 'price', 'start_date', 'end_date',
    ];

    protected function casts(): array
    {
        return [
            'status' => PackageStatus::class,
            'price' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'published_at' => 'datetime',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function inclusions(): BelongsToMany
    {
        return $this->belongsToMany(Inclusion::class);
    }

    public function isPublished(): bool
    {
        return $this->status === PackageStatus::Published;
    }
}
