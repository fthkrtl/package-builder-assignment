<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Publish-time business rules — the server side of the wizard's validation.
 *
 * TODO(fatih): this is yours to write. What it needs to do:
 *
 *  1. Validate the *stored* package, not the request body. The publish call
 *     carries no payload, so override validationData() and return the model's
 *     current state (property_id, title, price, start_date, end_date and the
 *     selected inclusion ids) as the array the rules run against.
 *     The model is available via $this->route('package').
 *
 *  2. Rules, straight from the brief:
 *       - property_id : required, exists
 *       - title       : required, 5–100 characters
 *       - price       : required, greater than zero  (gt:0, not min:0)
 *       - start_date  : required, date, not in the past
 *       - end_date    : required, date, after start_date
 *       - inclusions  : at least one
 *
 *  3. messages(): name the rule in words the UI can show, e.g.
 *       'inclusions.min' => 'At least one inclusion is required.'
 *
 * Laravel turns a failed FormRequest into 422 with {message, errors:{field:[...]}}
 * on its own — that structured shape is what the wizard maps back onto its steps,
 * so there is no custom error envelope to write.
 */
class PublishPackageRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [];
    }
}
