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
        'ora',
    ];

    private const DISPLAY_LABELS = [
        'intervento' => 'nº',
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

        if ($normalized === 'nº') {
            $normalized = 'intervento';
        }

        if (! in_array($normalized, self::CANONICAL, true)) {
            return 'ml';
        }

        return $normalized;
    }

    public static function label(string $value): string
    {
        return self::DISPLAY_LABELS[$value] ?? $value;
    }

    public static function options(): array
    {
        return array_map(fn (string $value) => [
            'value' => $value,
            'label' => self::label($value),
        ], self::CANONICAL);
    }
}
