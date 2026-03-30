<?php

namespace App\Support;

class QuotePricingOptions
{
    public const DISCOUNT_TYPES = ['percent', 'amount'];

    public const PAYMENT_METHODS = [
        'da Concordare',
        'Vista fattura',
        '30/60/90 gg D.F.',
        'Bonifico bancario',
        'Ri.Ba.',
    ];

    public const DEFAULT_PAYMENT_METHOD = 'da Concordare';
}
