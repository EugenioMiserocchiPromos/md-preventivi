<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\StoreQuoteItemRequest;
use App\Http\Resources\QuoteItemResource;
use App\Models\Quote;
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
}
