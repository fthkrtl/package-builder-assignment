<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Draft-level validation: type correctness only.
 *
 * A draft is allowed to be incomplete — the brief is explicit that "an empty
 * draft with only a title is fine" — so every field is `sometimes` + `nullable`.
 * The business rules live in PublishPackageRequest and run only on publish.
 */
class DraftPackageRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'property_id' => ['sometimes', 'nullable', 'integer', 'exists:properties,id'],
            'title' => ['sometimes', 'nullable', 'string', 'max:100'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date'],
            'inclusions' => ['sometimes', 'array'],
            'inclusions.*' => ['integer', 'exists:inclusions,id'],
        ];
    }
}
