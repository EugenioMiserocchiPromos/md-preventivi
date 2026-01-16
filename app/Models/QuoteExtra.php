<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteExtra extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_included' => 'bool',
        'is_fixed' => 'bool',
        'qty' => 'float',
        'unit_price' => 'float',
        'line_total' => 'float',
    ];

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }
}
