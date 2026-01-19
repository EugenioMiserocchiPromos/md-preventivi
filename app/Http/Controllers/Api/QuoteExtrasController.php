<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\StoreQuoteExtraRequest;
use App\Http\Requests\Quotes\UpdateQuoteExtraRequest;
use App\Http\Resources\QuoteExtraResource;
use App\Models\Quote;
use App\Models\QuoteExtra;
use App\Services\QuoteExtrasService;
use App\Services\QuoteTotalsService;
use App\Support\Units;

class QuoteExtrasController extends Controller
{
    public function index(Quote $quote, QuoteExtrasService $extrasService)
    {
        $extrasService->ensureFixedRows($quote);

        $extras = QuoteExtra::query()
            ->where('quote_id', $quote->id)
            ->orderBy('sort_index')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => QuoteExtraResource::collection($extras),
        ]);
    }

    public function store(
        Quote $quote,
        StoreQuoteExtraRequest $request,
        QuoteTotalsService $totalsService
    ) {
        $data = $request->validated();
        $data['unit'] = Units::normalize($data['unit'] ?? 'ml');
        $data['is_included'] = array_key_exists('is_included', $data) ? (bool) $data['is_included'] : true;
        $data['sort_index'] = $data['sort_index'] ?? ((int) ($quote->extras()->max('sort_index') ?? 0) + 1);
        $data['unit_price'] = (float) ($data['unit_price'] ?? 0);
        $data['qty'] = (float) ($data['qty'] ?? 0);
        $data['line_total'] = round($data['qty'] * $data['unit_price'], 2);
        $data['is_fixed'] = false;
        $data['fixed_key'] = null;

        $extra = $quote->extras()->create($data);

        $updatedQuote = $totalsService->recalculateAndPersist($quote->fresh());

        return response()->json([
            'extra' => new QuoteExtraResource($extra),
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ], 201);
    }

    public function update(
        QuoteExtra $extra,
        UpdateQuoteExtraRequest $request,
        QuoteTotalsService $totalsService
    ) {
        $data = $request->validated();
        if (array_key_exists('unit', $data)) {
            $data['unit'] = Units::normalize($data['unit']);
        }
        if (array_key_exists('is_included', $data)) {
            $data['is_included'] = (bool) $data['is_included'];
        }
        $nextQty = (float) ($data['qty'] ?? $extra->qty ?? 0);
        $nextUnitPrice = (float) ($data['unit_price'] ?? $extra->unit_price ?? 0);
        if (array_key_exists('unit_price', $data) || array_key_exists('qty', $data)) {
            $data['line_total'] = round($nextQty * $nextUnitPrice, 2);
        }

        $extra->fill($data);
        $extra->save();

        $updatedQuote = $totalsService->recalculateAndPersist($extra->quote()->first());

        return response()->json([
            'extra' => new QuoteExtraResource($extra),
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ]);
    }

    public function destroy(QuoteExtra $extra, QuoteTotalsService $totalsService)
    {
        if ($extra->is_fixed) {
            return response()->json([
                'message' => 'Non puoi eliminare una riga fissa.',
            ], 409);
        }

        $quote = $extra->quote()->first();
        $extra->delete();

        $updatedQuote = $totalsService->recalculateAndPersist($quote);

        return response()->json([
            'totals' => $totalsService->totalsPayload($updatedQuote),
        ]);
    }

}
