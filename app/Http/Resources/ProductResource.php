<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'code' => $this->code,
            'category_name' => $this->category_name,
            'name' => $this->name,
            'unit_default' => $this->unit_default,
            'price_default' => $this->price_default,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
