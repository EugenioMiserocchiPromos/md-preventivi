<?php

namespace App\Services;

use App\Models\Quote;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class QuotePdfService
{
    public function frontespizio(Quote $quote): string
    {
        $html = view('pdf.frontespizio', [
            'quote' => $quote,
        ])->render();

        return $this->htmlToPdf($html);
    }

    public function rows(Quote $quote): string
    {
        $html = view('pdf.quote_rows', [
            'quote' => $quote,
        ])->render();

        return $this->htmlToPdf($html);
    }

    public function full(Quote $quote): string
    {
        $frontHtml = view('pdf.frontespizio', [
            'quote' => $quote,
        ])->render();

        $rowsHtml = null;
        if ($quote->items->count() > 0) {
            $rowsHtml = view('pdf.quote_rows', [
                'quote' => $quote,
            ])->render();
        }

        $html = $this->composeFullHtml($frontHtml, $rowsHtml);

        return $this->htmlToPdf($html);
    }

    private function htmlToPdf(string $html): string
    {
        $htmlPath = tempnam(sys_get_temp_dir(), 'quote-html-').'.html';
        $pdfPath = tempnam(sys_get_temp_dir(), 'quote-pdf-').'.pdf';

        file_put_contents($htmlPath, $html);

        $bin = env('WEASYPRINT_BIN', 'weasyprint');
        $process = new Process([$bin, $htmlPath, $pdfPath]);
        $process->setTimeout(60);
        $process->run();

        if (! $process->isSuccessful()) {
            @unlink($htmlPath);
            @unlink($pdfPath);
            throw new ProcessFailedException($process);
        }

        $pdf = file_get_contents($pdfPath) ?: '';
        @unlink($htmlPath);
        @unlink($pdfPath);

        return $pdf;
    }

    private function composeFullHtml(string $frontHtml, ?string $rowsHtml): string
    {
        $front = $this->extractHtmlParts($frontHtml);
        $styles = $front['styles'];
        $body = $front['body'];

        if ($rowsHtml) {
            $rows = $this->extractHtmlParts($rowsHtml);
            $styles .= "\n".$rows['styles'];
            $body .= "\n<div style=\"page-break-after: always;\"></div>\n".$rows['body'];
        }

        return <<<HTML
<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Preventivo</title>
    <style>
{$styles}
    </style>
  </head>
  <body>
{$body}
  </body>
</html>
HTML;
    }

    private function extractHtmlParts(string $html): array
    {
        $styles = '';
        if (preg_match('/<style>(.*?)<\\/style>/is', $html, $styleMatch)) {
            $styles = trim($styleMatch[1]);
        }

        $body = $html;
        if (preg_match('/<body[^>]*>(.*?)<\\/body>/is', $html, $bodyMatch)) {
            $body = trim($bodyMatch[1]);
        }

        return [
            'styles' => $styles,
            'body' => $body,
        ];
    }
}
