<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\UpdateQuotePricingRequest;
use App\Http\Resources\QuoteResource;
use App\Models\Quote;
use App\Services\QuoteTotalsService;

class QuotePricingController extends Controller
{
    public function update(
        UpdateQuotePricingRequest $request,
        Quote $quote,
        QuoteTotalsService $service
    ) {
        $data = $request->validated();

        $quote->discount_type = $data['discount_type'] ?? null;
        $quote->discount_value = $data['discount_value'] ?? null;
        $quote->vat_rate = array_key_exists('vat_rate', $data)
            ? $data['vat_rate']
            : $quote->vat_rate;

        $quote->save();

        $service->recalculateAndPersist($quote);

        return new QuoteResource($quote->fresh());
    }
}
