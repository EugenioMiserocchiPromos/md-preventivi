<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\StoreQuoteItemRequest;
use App\Http\Requests\Quotes\UpdateQuoteItemRequest;
use App\Http\Resources\QuoteItemResource;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Services\QuoteItemService;
use App\Services\QuoteTotalsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuoteItemsController extends Controller
{
    public function store(
        Quote $quote,
        StoreQuoteItemRequest $request,
        QuoteItemService $service,
        QuoteTotalsService $totalsService
    ) {
        $item = $service->create(
            $quote,
            (int) $request->validated('product_id'),
            (float) ($request->validated('qty') ?? 1)
        );

        $updatedQuote = $totalsService->recalculateAndPersist($quote->fresh());

        return response()->json([
            'item' => new QuoteItemResource($item),
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ]);
    }

    public function update(
        UpdateQuoteItemRequest $request,
        QuoteItem $item,
        QuoteTotalsService $totalsService
    )
    {
        $data = $request->validated();
        $item->fill($data);
        $item->line_total = round(((float) $item->qty) * ((float) $item->unit_price_override), 2);
        $item->save();

        $item->load(['components']);

        $updatedQuote = $totalsService->recalculateAndPersist($item->quote()->first());

        return response()->json([
            'item' => new QuoteItemResource($item),
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ]);
    }

    public function destroy(QuoteItem $item, QuoteTotalsService $totalsService)
    {
        $quote = $item->quote()->first();
        $item->delete();

        $updatedQuote = $totalsService->recalculateAndPersist($quote);

        return response()->json([
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ]);
    }

    public function duplicate(
        QuoteItem $item,
        QuoteItemService $service,
        QuoteTotalsService $totalsService
    ) {
        $newItem = $service->duplicate($item);

        $updatedQuote = $totalsService->recalculateAndPersist($item->quote()->first());

        return response()->json([
            'item' => new QuoteItemResource($newItem),
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ]);
    }

    public function storeCategory(
        Quote $quote,
        Request $request,
        QuoteItemService $service,
        QuoteTotalsService $totalsService
    ) {
        $validated = $request->validate([
            'category_name' => ['required', 'string', 'max:255'],
        ]);

        $categoryName = trim((string) $validated['category_name']);
        if ($categoryName === '') {
            return response()->json(['message' => 'Categoria non valida.'], 422);
        }

        $products = DB::table('products')
            ->where('is_active', true)
            ->where('category_name', $categoryName)
            ->orderBy('code')
            ->get(['id']);

        if ($products->isEmpty()) {
            return response()->json(['message' => 'Categoria non trovata.'], 404);
        }

        $existingIds = $quote->items()
            ->pluck('product_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->all();
        $existingSet = array_fill_keys($existingIds, true);

        $added = 0;
        foreach ($products as $product) {
            $productId = (int) $product->id;
            if (isset($existingSet[$productId])) {
                continue;
            }
            $service->create($quote, $productId, 1);
            $added++;
        }

        $updatedQuote = $totalsService->recalculateAndPersist($quote->fresh());

        return response()->json([
            'added' => $added,
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ]);
    }

    public function moveCategory(
        Quote $quote,
        Request $request,
        QuoteItemService $service
    ) {
        $validated = $request->validate([
            'category_name' => ['required', 'string', 'max:255'],
            'direction' => ['required', 'in:up,down'],
        ]);

        $categoryName = trim((string) $validated['category_name']);
        if ($categoryName === '') {
            return response()->json(['message' => 'Categoria non valida.'], 422);
        }

        $exists = $quote->items()
            ->where('category_name_snapshot', $categoryName)
            ->exists();

        if (! $exists) {
            return response()->json(['message' => 'Categoria non trovata nel preventivo.'], 404);
        }

        $moved = $service->moveCategory($quote, $categoryName, (string) $validated['direction']);

        return response()->json([
            'moved' => $moved,
        ]);
    }
}
