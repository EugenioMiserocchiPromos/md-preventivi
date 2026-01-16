<?php

namespace App\Http\Requests\Quotes;

use App\Support\Units;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuoteExtraRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'max:255'],
            'unit' => ['nullable', 'string', Rule::in(Units::CANONICAL)],
            'qty' => ['required', 'numeric', 'min:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'is_included' => ['sometimes', 'boolean'],
            'sort_index' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('unit')) {
            $this->merge([
                'unit' => Units::normalize($this->input('unit')),
            ]);
        }
    }
}
