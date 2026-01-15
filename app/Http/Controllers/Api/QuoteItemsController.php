<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\StoreQuoteItemRequest;
use App\Http\Requests\Quotes\UpdateQuoteItemRequest;
use App\Http\Resources\QuoteItemResource;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Services\QuoteItemService;

class QuoteItemsController extends Controller
{
    public function store(
        Quote $quote,
        StoreQuoteItemRequest $request,
        QuoteItemService $service
    ) {
        $item = $service->create(
            $quote,
            (int) $request->validated('product_id'),
            (float) ($request->validated('qty') ?? 1)
        );

        return new QuoteItemResource($item);
    }

    public function update(UpdateQuoteItemRequest $request, QuoteItem $item)
    {
        $data = $request->validated();
        $item->fill($data);
        $item->line_total = round(((float) $item->qty) * ((float) $item->unit_price_override), 2);
        $item->save();

        $item->load(['components', 'pose']);

        return new QuoteItemResource($item);
    }

    public function destroy(QuoteItem $item)
    {
        $item->delete();

        return response()->noContent();
    }
}
