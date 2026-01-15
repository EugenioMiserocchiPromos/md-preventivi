<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteItemComponentResource extends JsonResource
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
            'quote_item_id' => $this->quote_item_id,
            'name_snapshot' => $this->name_snapshot,
            'unit_override' => $this->unit_override,
            'qty' => $this->qty,
            'unit_price_override' => $this->unit_price_override,
            'component_total' => $this->component_total,
            'is_visible' => (bool) $this->is_visible,
            'sort_index' => $this->sort_index,
        ];
    }
}
