<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The business rules a package has to satisfy to be published.
 *
 * The publish call carries no payload, so validationData() runs the rules against the
 * stored package instead of the request body: the API validates what it holds, not what
 * the client claims. A failure returns Laravel's own 422 shape, which the wizard maps
 * back onto the step that owns each field.
 */
class PublishPackageRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {

        return [
            'property_id' => ['required', 'exists:properties,id'],
            'title' => ['required', 'string', 'min:5', 'max:100'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'gt:0'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'inclusions' => ['present', 'array', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'inclusions.min' => 'At least one inclusion is required.',
            'property_id.required' => 'A property must be selected.',
        ];
    }

    public function validationData(): array
    {
        $package = $this->route('package');

        return [
            'property_id' => $package->property_id,
            'title' => $package->title,
            'subtitle' => $package->subtitle, // optional
            'description' => $package->description, // optional
            'price' => $package->price,
            'start_date' => $package->start_date?->toDateString(),
            'end_date' => $package->end_date?->toDateString(),
            'inclusions' => $package->inclusions->pluck('id')->all(),
        ];
    }
}
