<?php

namespace App\Http\Requests\Quotes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuoteTitleTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('label')) {
            $label = preg_replace('/\s+/', ' ', trim((string) $this->input('label')));
            $this->merge(['label' => $label]);
        }
    }

    public function rules(): array
    {
        return [
            'label' => [
                'required',
                'string',
                'max:255',
                Rule::unique('quote_title_templates', 'label'),
            ],
        ];
    }
}
