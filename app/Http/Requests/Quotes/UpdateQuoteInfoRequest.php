<?php

namespace App\Http\Requests\Quotes;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuoteInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'cantiere' => ['required', 'string', 'max:255'],
            'title_text' => ['required', 'string', 'max:255'],
        ];
    }
}
