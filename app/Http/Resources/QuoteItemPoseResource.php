<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteItemPoseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if ($this->resource === null) {
            return [];
        }

        return [
            'id' => $this->id,
            'quote_item_id' => $this->quote_item_id,
            'pose_type' => $this->pose_type,
            'unit' => $this->unit,
            'qty' => $this->qty,
            'unit_price' => $this->unit_price,
            'pose_total' => $this->pose_total,
            'is_included' => (bool) $this->is_included,
            'is_visible' => (bool) $this->is_visible,
        ];
    }
}
