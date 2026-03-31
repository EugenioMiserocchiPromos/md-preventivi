<?php

namespace App\Support;

class QuotePricingOptions
{
    public const DISCOUNT_TYPES = ['percent', 'amount'];

    public const PAYMENT_METHODS = [
    'da Concordare',
    'RD - Anticipato',
    'RD - Vista fattura',
    'RD - 30 GG FM',
    'RD - 60 GG FM',
    'RD - 90 GG FM',
    'RD - 120 GG FM',
    'RD - 30/60 GG FM',
    'RD - 60/90 GG FM',
    'RD - 90/120 GG FM',
    'RD - 30/60/90 GG FM',
    'RB - 30 GG FM',
    'RB - 60 GG FM',
    'RB - 90 GG FM',
    'RB - 120 GG FM',
    'RB - 30/60 GG FM',
    'RB - 60/90 GG FM',
    'RB - 90/120 GG FM',
    'RB - 30/60/90 GG FM',
    'BB - Anticipato',
    'BB - Vista fattura',
    'BB - 30 GG FM',
    'BB - 60 GG FM',
    'BB - 90 GG FM',
    'BB - 120 GG FM',
    'BB - 30/60 GG FM',
    'BB - 60/90 GG FM',
    'BB - 90/120 GG FM',
    'BB - 30/60/90 GG FM',
];

    public const DEFAULT_PAYMENT_METHOD = 'da Concordare';

    public static function options(): array
    {
        return [
            'payment_methods' => self::PAYMENT_METHODS,
            'default_payment_method' => self::DEFAULT_PAYMENT_METHOD,
            'no_iban_payment_method' => self::DEFAULT_PAYMENT_METHOD,
        ];
    }
}
