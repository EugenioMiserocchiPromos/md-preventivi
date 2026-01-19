<?php

namespace App\Services;

use App\Models\Quote;
use Illuminate\Support\Facades\DB;

class QuoteExtrasService
{
    public const FIXED_KEYS = ['warranty_10y', 'extra_2', 'extra_3'];
    private const DESCRIPTIONS = [
        'warranty_10y' => 'Garanzia 10 anni',
        'extra_2' => 'Assistenza tecnica in cantiere e Progettazione vasca',
        'extra_3' => 'Oneri derivanti da trasferte personale applicatore tecnico',
    ];

    public function ensureFixedRows(Quote $quote): void
    {
        $existingKeys = DB::table('quote_extras')
            ->where('quote_id', $quote->id)
            ->whereNotNull('fixed_key')
            ->pluck('fixed_key')
            ->all();

        foreach (self::FIXED_KEYS as $key) {
            $description = self::DESCRIPTIONS[$key] ?? 'Extra';
            DB::table('quote_extras')
                ->where('quote_id', $quote->id)
                ->where('fixed_key', $key)
                ->update([
                    'description' => $description,
                    'updated_at' => now(),
                ]);
        }

        $missingKeys = array_values(array_diff(self::FIXED_KEYS, $existingKeys));
        if (empty($missingKeys)) {
            return;
        }

        $nextIndex = (int) (DB::table('quote_extras')
            ->where('quote_id', $quote->id)
            ->max('sort_index') ?? 0);

        foreach ($missingKeys as $offset => $key) {
            $description = self::DESCRIPTIONS[$key] ?? 'Extra';

            DB::table('quote_extras')->insert([
                'quote_id' => $quote->id,
                'description' => $description,
                'amount' => 0,
                'unit' => 'ml',
                'qty' => 1,
                'unit_price' => 0,
                'line_total' => 0,
                'notes' => null,
                'is_included' => $key !== 'warranty_10y',
                'is_fixed' => true,
                'fixed_key' => $key,
                'sort_index' => $nextIndex + $offset + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
