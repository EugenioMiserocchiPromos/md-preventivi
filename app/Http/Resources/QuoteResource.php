<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quote_type' => $this->quote_type,
            'customer_id' => $this->customer_id,
            'customer_title_snapshot' => $this->customer_title_snapshot,
            'customer_body_snapshot' => $this->customer_body_snapshot,
            'customer_email_snapshot' => $this->customer_email_snapshot,
            'prot_display' => $this->prot_display,
            'prot_internal' => $this->prot_internal,
            'prot_year' => $this->prot_year,
            'prot_number' => $this->prot_number,
            'revision_number' => $this->revision_number,
            'date' => $this->date,
            'cantiere' => $this->cantiere,
            'title_template_id' => $this->title_template_id,
            'title_text' => $this->title_text,
            'discount_type' => $this->discount_type,
            'discount_value' => $this->discount_value,
            'vat_rate' => $this->vat_rate,
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_amount,
            'taxable_total' => $this->taxable_total,
            'vat_amount' => $this->vat_amount,
            'grand_total' => $this->grand_total,
            'created_by_user_id' => $this->created_by_user_id,
            'items' => QuoteItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
