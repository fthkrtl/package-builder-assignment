<?php

namespace App\Http\Resources;

use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The list screen needs less than the wizard does: enough to render a row and
 * decide between "Continue" and "View".
 *
 * @mixin Package
 */
class PackageListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'title' => $this->title,
            'price' => $this->price,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'property' => PropertyResource::make($this->whenLoaded('property')),
            'inclusions_count' => $this->inclusions_count,
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
