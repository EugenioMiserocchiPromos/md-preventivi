<?php

namespace App\Services;

use App\Models\Quote;
use Barryvdh\DomPDF\Facade\Pdf;

class QuotePdfService
{
    public function frontespizio(Quote $quote)
    {
        return Pdf::loadView('pdf.frontespizio', [
            'quote' => $quote,
        ])->setPaper('a4');
    }

    public function full(Quote $quote)
    {
        return Pdf::loadView('pdf.quote_full', [
            'quote' => $quote,
        ])->setPaper('a4');
    }
}
