<?php

namespace App\Http\Requests\Quotes;

use App\Support\Units;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuoteItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_override' => ['sometimes', 'string', 'max:32', Rule::in(Units::CANONICAL)],
            'qty' => ['sometimes', 'numeric', 'min:0'],
            'unit_price_override' => ['sometimes', 'numeric', 'min:0'],
            'note_shared' => ['sometimes', 'nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('unit_override')) {
            $this->merge([
                'unit_override' => Units::normalize($this->input('unit_override')),
            ]);
        }
    }
}
