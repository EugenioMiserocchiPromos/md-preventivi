<?php

namespace App\Support;

class ProductNameHtmlSanitizer
{
    public function sanitize(string $html): string
    {
        $html = trim($html);
        if ($html === '') {
            return '';
        }

        $html = strip_tags($html, '<b><strong>');
        $html = preg_replace('/<(b|strong)\s+[^>]*>/i', '<$1>', $html);
        $html = preg_replace('/\s+/u', ' ', $html);

        return trim((string) $html);
    }
}

