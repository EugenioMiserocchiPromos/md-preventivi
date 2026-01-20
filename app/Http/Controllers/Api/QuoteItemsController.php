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
use App\Support\Units;

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
        if (array_key_exists('unit_override', $data)) {
            $data['unit_override'] = Units::normalize($data['unit_override']);
        }
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
}
