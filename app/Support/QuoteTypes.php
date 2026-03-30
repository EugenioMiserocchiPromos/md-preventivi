<?php

namespace App\Support;

class QuoteTypes
{
    public const FP = 'FP';
    public const AS = 'AS';
    public const VM = 'VM';
    public const DEFAULT = self::FP;

    private const OPTIONS = [
        self::FP => [
            'label' => 'Fornitura e Posa in opera',
            'list_path' => '/preventivi/fp',
        ],
        self::AS => [
            'label' => 'Assistenza',
            'list_path' => '/preventivi/as',
        ],
        self::VM => [
            'label' => 'Vendita Materiale',
            'list_path' => '/preventivi/vm',
        ],
    ];

    public static function values(): array
    {
        return array_keys(self::OPTIONS);
    }

    public static function listPath(?string $type): string
    {
        $type = strtoupper((string) $type);

        return self::OPTIONS[$type]['list_path'] ?? self::OPTIONS[self::DEFAULT]['list_path'];
    }
}
