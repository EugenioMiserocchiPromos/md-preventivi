<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quote extends Model
{
    protected $guarded = [];

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function extras(): HasMany
    {
        return $this->hasMany(QuoteExtra::class);
    }
}
