<?php

namespace App\Http\Requests\Quotes;

use App\Support\QuoteTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quote_type' => ['required', Rule::in(QuoteTypes::values())],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'date' => ['required', 'date'],
            'cantiere' => ['required', 'string', 'max:255'],
            'title_text' => ['required', 'string', 'max:255'],
            'vat_rate' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
