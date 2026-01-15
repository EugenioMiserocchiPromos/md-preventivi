<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItemPose extends Model
{
    protected $table = 'quote_item_pose';

    protected $fillable = [
        'quote_item_id',
        'pose_type',
        'unit',
        'qty',
        'unit_price',
        'pose_total',
        'is_included',
        'is_visible',
    ];

    public function quoteItem(): BelongsTo
    {
        return $this->belongsTo(QuoteItem::class);
    }
}
