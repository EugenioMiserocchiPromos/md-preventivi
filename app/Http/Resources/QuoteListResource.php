<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteListResource extends JsonResource
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
            'prot_display' => $this->prot_display,
            'revision_number' => $this->revision_number,
            'date' => $this->date,
            'title_text' => $this->title_text,
            'customer_title_snapshot' => $this->customer_title_snapshot,
            'cantiere' => $this->cantiere,
            'grand_total' => $this->grand_total,
        ];
    }
}
