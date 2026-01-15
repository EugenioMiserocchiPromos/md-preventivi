<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\UpdateQuoteItemComponentRequest;
use App\Http\Resources\QuoteItemComponentResource;
use App\Models\QuoteItemComponent;

class QuoteItemComponentsController extends Controller
{
    public function update(
        UpdateQuoteItemComponentRequest $request,
        QuoteItemComponent $component
    ) {
        $data = $request->validated();
        if (array_key_exists('is_visible', $data)) {
            $data['is_visible'] = (bool) $data['is_visible'];
        }

        $component->fill($data);
        $component->component_total = round(
            ((float) ($component->qty ?? 0)) * ((float) ($component->unit_price_override ?? 0)),
            2
        );
        $component->save();

        return new QuoteItemComponentResource($component);
    }
}
