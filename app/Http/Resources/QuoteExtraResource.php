<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteExtraResource extends JsonResource
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
            'quote_id' => $this->quote_id,
            'description' => $this->description,
            'unit' => $this->unit,
            'qty' => $this->qty,
            'unit_price' => $this->unit_price,
            'line_total' => $this->line_total,
            'notes' => $this->notes,
            'is_included' => $this->is_included,
            'is_fixed' => $this->is_fixed,
            'fixed_key' => $this->fixed_key,
            'sort_index' => $this->sort_index,
        ];
    }
}
