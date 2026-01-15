<?php

namespace App\Http\Requests\Quotes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuotePricingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'discount_type' => ['nullable', Rule::in(['percent', 'amount'])],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'vat_rate' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('discount_type');
            $value = $this->input('discount_value');

            if ($type === 'percent' && $value !== null && $value > 100) {
                $validator->errors()->add('discount_value', 'Il valore percentuale non può superare 100.');
            }
        });
    }
}
