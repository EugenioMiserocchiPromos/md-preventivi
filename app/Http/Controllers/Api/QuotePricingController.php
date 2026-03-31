<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\UpdateQuotePricingRequest;
use App\Http\Resources\QuoteResource;
use App\Models\Quote;
use App\Services\QuoteTotalsService;
use App\Support\QuotePricingOptions;

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
        if (array_key_exists('payment_method', $data)) {
            $quote->payment_method = $data['payment_method'];
        }
        if (array_key_exists('payment_iban', $data)) {
            $quote->payment_iban = $data['payment_iban'];
        }
        if (($quote->payment_method ?? null) === QuotePricingOptions::DEFAULT_PAYMENT_METHOD) {
            $quote->payment_iban = '';
        }
        $quote->vat_rate = 0;

        $quote->save();

        $service->recalculateAndPersist($quote);

        return new QuoteResource($quote->fresh());
    }
}
