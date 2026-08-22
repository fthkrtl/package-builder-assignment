<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The single-package payload the wizard restores a draft from.
 *
 * @mixin \App\Models\Package
 */
class PackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'property' => PropertyResource::make($this->whenLoaded('property')),
            'inclusions' => InclusionResource::collection($this->whenLoaded('inclusions')),
            'published_at' => $this->published_at?->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
