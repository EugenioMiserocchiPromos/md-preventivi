<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItemComponent extends Model
{
    protected $fillable = [
        'name_snapshot',
        'unit_override',
        'qty',
        'unit_price_override',
        'component_total',
        'is_visible',
        'sort_index',
    ];

    public function quoteItem(): BelongsTo
    {
        return $this->belongsTo(QuoteItem::class);
    }
}
