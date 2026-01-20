<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteItemResource extends JsonResource
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
            'product_id' => $this->product_id,
            'category_name_snapshot' => $this->category_name_snapshot,
            'product_code_snapshot' => $this->product_code_snapshot,
            'name_snapshot' => $this->name_snapshot,
            'unit_override' => $this->unit_override,
            'qty' => $this->qty,
            'unit_price_override' => $this->unit_price_override,
            'line_total' => $this->line_total,
            'note_shared' => $this->note_shared,
            'sort_index' => $this->sort_index,
            'components' => QuoteItemComponentResource::collection($this->whenLoaded('components')),
        ];
    }
}
