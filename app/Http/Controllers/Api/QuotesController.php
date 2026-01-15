<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuoteResource;
use App\Models\Quote;

class QuotesController extends Controller
{
    public function show(Quote $quote)
    {
        $quote->load([
            'items' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
            'items.components' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
            'items.pose',
        ]);

        return new QuoteResource($quote);
    }
}
