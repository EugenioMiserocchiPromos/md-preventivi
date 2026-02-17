<?php

namespace App\Services;

use App\Models\Quote;
use Barryvdh\DomPDF\Facade\Pdf;
use iio\libmergepdf\Merger;

class QuotePdfService
{
    public function frontespizio(Quote $quote): string
    {
        return Pdf::loadView('pdf.frontespizio', [
            'quote' => $quote,
        ])->setPaper('a4')->output();
    }

    public function rows(Quote $quote): string
    {
        return Pdf::loadView('pdf.quote_rows', [
            'quote' => $quote,
        ])->setPaper('a4')->output();
    }

    public function full(Quote $quote): string
    {
        $merger = new Merger();
        $merger->addRaw($this->frontespizio($quote));
        if ($quote->items->count() > 0) {
            $merger->addRaw($this->rows($quote));
        }

        return $merger->merge();
    }
}
