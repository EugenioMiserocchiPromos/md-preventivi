<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductComponentResource extends JsonResource
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
            'product_id' => $this->product_id,
            'name' => $this->name,
            'unit_default' => $this->unit_default,
            'qty_default' => $this->qty_default,
            'price_default' => $this->price_default,
            'default_visible' => (bool) $this->default_visible,
            'sort_index' => $this->sort_index,
        ];
    }
}
