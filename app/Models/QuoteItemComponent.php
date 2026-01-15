<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItemComponent extends Model
{
    protected $fillable = [
        'unit_override',
        'qty',
        'unit_price_override',
        'is_visible',
    ];

    public function quoteItem(): BelongsTo
    {
        return $this->belongsTo(QuoteItem::class);
    }
}
