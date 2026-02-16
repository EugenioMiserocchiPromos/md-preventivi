<?php

namespace App\Support;

class Units
{
    public const CANONICAL = [
        'pz',
        'mq',
        'intervento',
        'ml',
        'mc',
        'a corpo',
        'cad.',
        'kg.',
    ];

    public static function normalize(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        if ($normalized === 'a_corpo' || $normalized === 'a-corpo') {
            $normalized = 'a corpo';
        }

        if ($normalized === 'cad') {
            $normalized = 'cad.';
        }

        if ($normalized === 'kg') {
            $normalized = 'kg.';
        }

        if (! in_array($normalized, self::CANONICAL, true)) {
            return 'ml';
        }

        return $normalized;
    }
}
