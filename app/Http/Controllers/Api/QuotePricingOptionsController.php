<?php

namespace App\Http\Controllers\Api;

use App\Support\QuotePricingOptions;

class QuotePricingOptionsController
{
    public function index(): array
    {
        return QuotePricingOptions::options();
    }
}
