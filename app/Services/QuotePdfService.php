<?php

namespace App\Services;

use App\Models\Quote;
use Barryvdh\DomPDF\Facade\Pdf;

class QuotePdfService
{
    public function full(Quote $quote)
    {
        return Pdf::loadView('pdf.quote_full', [
            'quote' => $quote,
        ])->setPaper('a4');
    }
}
