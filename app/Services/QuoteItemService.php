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
                'name_snapshot_html' => $product->name_html ?? $product->name,
                'unit_override' => $product->unit_default,
                'qty' => $qty,
                'unit_price_override' => $unitPrice,
                'line_total' => $lineTotal,
                'note_shared' => $product->note_default ?: null,
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

            return $item->load(['components']);
        });
    }

    public function duplicate(QuoteItem $item): QuoteItem
    {
        return DB::transaction(function () use ($item) {
            $item->loadMissing('components');
            $quoteId = (int) $item->quote_id;
            $originalSortIndex = (int) ($item->sort_index ?? 0);

            DB::table('quote_items')
                ->where('quote_id', $quoteId)
                ->where('sort_index', '>', $originalSortIndex)
                ->increment('sort_index', 1);

            $lineTotal = round(((float) $item->qty) * ((float) $item->unit_price_override), 2);

            $newItem = QuoteItem::create([
                'quote_id' => $quoteId,
                'product_id' => $item->product_id,
                'category_name_snapshot' => $item->category_name_snapshot,
                'product_code_snapshot' => $item->product_code_snapshot,
                'name_snapshot' => $item->name_snapshot,
                'name_snapshot_html' => $item->name_snapshot_html,
                'unit_override' => $item->unit_override,
                'qty' => $item->qty,
                'unit_price_override' => $item->unit_price_override,
                'line_total' => $lineTotal,
                'note_shared' => $item->note_shared,
                'sort_index' => $originalSortIndex + 1,
            ]);

            if ($item->components->isNotEmpty()) {
                $now = now();
                $payload = $item->components->map(function ($component) use ($newItem, $now) {
                    $qty = $component->qty === null ? 0.0 : (float) $component->qty;
                    $price = $component->unit_price_override === null ? 0.0 : (float) $component->unit_price_override;

                    return [
                        'quote_item_id' => $newItem->id,
                        'name_snapshot' => $component->name_snapshot,
                        'unit_override' => $component->unit_override,
                        'qty' => $qty,
                        'unit_price_override' => $price,
                        'component_total' => round($qty * $price, 2),
                        'is_visible' => (bool) $component->is_visible,
                        'sort_index' => $component->sort_index,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                })->all();

                DB::table('quote_item_components')->insert($payload);
            }

            return $newItem->load(['components']);
        });
    }
}
