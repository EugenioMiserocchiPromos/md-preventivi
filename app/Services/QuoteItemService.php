<?php

namespace App\Services;

use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Support\Facades\DB;

class QuoteItemService
{
    public function create(Quote $quote, int $productId, float $qty): QuoteItem
    {
        return DB::transaction(function () use ($quote, $productId, $qty) {
            $product = DB::table('products')->where('id', $productId)->first();

            $components = DB::table('product_components')
                ->where('product_id', $productId)
                ->orderBy('sort_index')
                ->orderBy('id')
                ->get();

            $currentMax = DB::table('quote_items')
                ->where('quote_id', $quote->id)
                ->max('sort_index');
            $sortIndex = $currentMax === null ? 0 : ((int) $currentMax + 1);

            $unitPrice = (float) $product->price_default;
            $lineTotal = round($qty * $unitPrice, 2);

            $item = QuoteItem::create([
                'quote_id' => $quote->id,
                'product_id' => $productId,
                'category_name_snapshot' => $product->category_name,
                'product_code_snapshot' => $product->code,
                'name_snapshot' => $product->name,
                'unit_override' => $product->unit_default,
                'qty' => $qty,
                'unit_price_override' => $unitPrice,
                'line_total' => $lineTotal,
                'note_shared' => null,
                'sort_index' => $sortIndex,
            ]);

            if ($components->isNotEmpty()) {
                $now = now();
                $payload = $components->map(function ($component) use ($item, $now) {
                    $componentQty = $component->qty_default === null ? 0.0 : (float) $component->qty_default;
                    $componentPrice = $component->price_default === null ? 0.0 : (float) $component->price_default;

                    return [
                        'quote_item_id' => $item->id,
                        'name_snapshot' => $component->name,
                        'unit_override' => $component->unit_default,
                        'qty' => $componentQty,
                        'unit_price_override' => $componentPrice,
                        'component_total' => round($componentQty * $componentPrice, 2),
                        'is_visible' => (bool) $component->default_visible,
                        'sort_index' => $component->sort_index,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                })->all();

                DB::table('quote_item_components')->insert($payload);
            }

            return $item->load(['components', 'pose']);
        });
    }
}
