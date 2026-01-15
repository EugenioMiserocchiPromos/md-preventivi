<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\UpsertQuoteItemPoseRequest;
use App\Http\Resources\QuoteItemPoseResource;
use App\Models\QuoteItem;
use App\Models\QuoteItemPose;

class QuoteItemPoseController extends Controller
{
    public function upsert(UpsertQuoteItemPoseRequest $request, QuoteItem $item)
    {
        $data = $request->validated();
        $qty = (float) ($data['qty'] ?? 0);
        $unitPrice = (float) ($data['unit_price'] ?? 0);
        $isIncluded = (bool) ($data['is_included'] ?? false);

        $data['pose_total'] = $isIncluded ? 0 : round($qty * $unitPrice, 2);
        $data['is_included'] = $isIncluded;
        $data['is_visible'] = (bool) ($data['is_visible'] ?? true);

        $pose = QuoteItemPose::updateOrCreate(
            ['quote_item_id' => $item->id],
            [
                'pose_type' => $data['pose_type'],
                'unit' => $data['unit'],
                'qty' => $qty,
                'unit_price' => $unitPrice,
                'pose_total' => $data['pose_total'],
                'is_included' => $data['is_included'],
                'is_visible' => $data['is_visible'],
            ]
        );

        return new QuoteItemPoseResource($pose);
    }

    public function destroy(QuoteItem $item)
    {
        QuoteItemPose::where('quote_item_id', $item->id)->delete();

        return response()->noContent();
    }
}
