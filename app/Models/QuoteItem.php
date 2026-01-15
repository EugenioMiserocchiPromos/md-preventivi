<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class QuoteItem extends Model
{
    protected $guarded = [];

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function components(): HasMany
    {
        return $this->hasMany(QuoteItemComponent::class)->orderBy('sort_index')->orderBy('id');
    }

    public function pose(): HasOne
    {
        return $this->hasOne(QuoteItemPose::class);
    }
}
