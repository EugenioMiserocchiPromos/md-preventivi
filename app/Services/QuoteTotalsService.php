<?php

namespace App\Services;

use App\Models\Quote;
use Illuminate\Support\Facades\DB;

class QuoteTotalsService
{
    public function recalculateAndPersist(Quote $quote): Quote
    {
        $itemsTotal = (float) DB::table('quote_items')
            ->where('quote_id', $quote->id)
            ->sum('line_total');

        $componentsTotal = (float) DB::table('quote_item_components')
            ->join('quote_items', 'quote_items.id', '=', 'quote_item_components.quote_item_id')
            ->where('quote_items.quote_id', $quote->id)
            ->sum('quote_item_components.component_total');

        $poseTotal = (float) DB::table('quote_item_pose')
            ->join('quote_items', 'quote_items.id', '=', 'quote_item_pose.quote_item_id')
            ->where('quote_items.quote_id', $quote->id)
            ->sum('quote_item_pose.pose_total');

        $extrasTotal = (float) DB::table('quote_extras')
            ->where('quote_id', $quote->id)
            ->sum('amount');

        $subtotal = round($itemsTotal + $componentsTotal + $poseTotal + $extrasTotal, 2);

        $discountAmount = 0.0;
        if ($quote->discount_type === 'percent' && $quote->discount_value !== null) {
            $discountAmount = $subtotal * ((float) $quote->discount_value / 100);
        } elseif ($quote->discount_type === 'amount' && $quote->discount_value !== null) {
            $discountAmount = (float) $quote->discount_value;
        }

        $discountAmount = round(min(max($discountAmount, 0), $subtotal), 2);
        $taxableTotal = round($subtotal - $discountAmount, 2);
        $vatRate = (float) ($quote->vat_rate ?? 0);
        $vatAmount = round($taxableTotal * ($vatRate / 100), 2);
        $grandTotal = round($taxableTotal + $vatAmount, 2);

        $quote->subtotal = $subtotal;
        $quote->discount_amount = $discountAmount;
        $quote->taxable_total = $taxableTotal;
        $quote->vat_amount = $vatAmount;
        $quote->grand_total = $grandTotal;
        $quote->save();

        return $quote;
    }
}
