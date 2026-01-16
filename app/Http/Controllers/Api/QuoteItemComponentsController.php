<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\UpdateQuoteItemComponentRequest;
use App\Http\Resources\QuoteItemComponentResource;
use App\Models\QuoteItemComponent;
use App\Services\QuoteTotalsService;
use App\Support\Units;

class QuoteItemComponentsController extends Controller
{
    public function update(
        UpdateQuoteItemComponentRequest $request,
        QuoteItemComponent $component,
        QuoteTotalsService $totalsService
    ) {
        $data = $request->validated();
        if (array_key_exists('is_visible', $data)) {
            $data['is_visible'] = (bool) $data['is_visible'];
        }
        if (array_key_exists('unit_override', $data)) {
            $data['unit_override'] = Units::normalize($data['unit_override']);
        }

        $component->fill($data);
        $component->component_total = round(
            ((float) ($component->qty ?? 0)) * ((float) ($component->unit_price_override ?? 0)),
            2
        );
        $component->save();

        $quote = $component->quoteItem()->first()->quote()->first();
        $updatedQuote = $totalsService->recalculateAndPersist($quote);

        return response()->json([
            'component' => new QuoteItemComponentResource($component),
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ]);
    }
}
