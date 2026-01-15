<?php

namespace App\Http\Requests\Quotes;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuoteItemComponentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_override' => ['sometimes', 'string', 'max:32'],
            'qty' => ['sometimes', 'numeric', 'min:0'],
            'unit_price_override' => ['sometimes', 'numeric', 'min:0'],
            'is_visible' => ['sometimes', 'boolean'],
        ];
    }
}
