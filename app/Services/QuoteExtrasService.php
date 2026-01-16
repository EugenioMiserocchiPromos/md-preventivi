<?php

namespace App\Services;

use App\Models\Quote;
use Illuminate\Support\Facades\DB;

class QuoteExtrasService
{
    public const FIXED_KEYS = ['extra_1', 'extra_2', 'extra_3'];

    public function ensureFixedRows(Quote $quote): void
    {
        $existingKeys = DB::table('quote_extras')
            ->where('quote_id', $quote->id)
            ->whereNotNull('fixed_key')
            ->pluck('fixed_key')
            ->all();

        $missingKeys = array_values(array_diff(self::FIXED_KEYS, $existingKeys));
        if (empty($missingKeys)) {
            return;
        }

        $nextIndex = (int) (DB::table('quote_extras')
            ->where('quote_id', $quote->id)
            ->max('sort_index') ?? 0);

        foreach ($missingKeys as $offset => $key) {
            $labelIndex = array_search($key, self::FIXED_KEYS, true);
            $description = $labelIndex === false ? 'Extra' : 'Extra ' . ($labelIndex + 1);

            DB::table('quote_extras')->insert([
                'quote_id' => $quote->id,
                'description' => $description,
                'amount' => 0,
                'unit' => 'ml',
                'qty' => 1,
                'unit_price' => 0,
                'line_total' => 0,
                'notes' => null,
                'is_included' => true,
                'is_fixed' => true,
                'fixed_key' => $key,
                'sort_index' => $nextIndex + $offset + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
