<?php

namespace App\Http\Requests\Quotes;

use Illuminate\Foundation\Http\FormRequest;

class UpsertQuoteItemPoseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pose_type' => [
                'required',
                'string',
                'max:64',
                \Illuminate\Validation\Rule::in([
                    'Posa in opera',
                    "Posa di competenza dell'impresa",
                    'Fornitura e posa in opera',
                ]),
            ],
            'unit' => ['required', 'string', 'max:32'],
            'qty' => ['required', 'numeric', 'min:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'is_included' => ['sometimes', 'boolean'],
        ];
    }
}
