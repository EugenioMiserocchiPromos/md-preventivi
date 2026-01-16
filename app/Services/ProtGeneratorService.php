<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ProtGeneratorService
{
    public function allocate(string $initials, string $quoteType, ?int $year = null): array
    {
        $year = $year ?? (int) now()->format('Y');
        $initials = trim($initials) !== '' ? strtoupper(trim($initials)) : 'NA';
        $quoteType = strtoupper($quoteType);

        return DB::transaction(function () use ($year, $initials, $quoteType) {
            $counter = DB::table('quote_counters')
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if (! $counter) {
                $maxExisting = (int) (DB::table('quotes')
                    ->where('prot_year', $year)
                    ->max('prot_number') ?? 0);

                DB::table('quote_counters')->insert([
                    'year' => $year,
                    'current_number' => $maxExisting,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $counter = (object) ['current_number' => $maxExisting];
            } else {
                $maxExisting = (int) (DB::table('quotes')
                    ->where('prot_year', $year)
                    ->max('prot_number') ?? 0);

                if ((int) $counter->current_number < $maxExisting) {
                    $counter->current_number = $maxExisting;
                }
            }

            $nextNumber = (int) $counter->current_number + 1;

            DB::table('quote_counters')
                ->where('year', $year)
                ->update([
                    'current_number' => $nextNumber,
                    'updated_at' => now(),
                ]);

            $padded = str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
            $yearShort = substr((string) $year, -2);
            $protDisplay = "{$initials}/{$quoteType} {$padded}-{$yearShort}";
            $protInternal = "{$initials}/{$quoteType} {$padded}-{$yearShort}-REV1";

            return [
                'prot_year' => $year,
                'prot_number' => $nextNumber,
                'revision_number' => 1,
                'prot_display' => $protDisplay,
                'prot_internal' => $protInternal,
            ];
        });
    }
}
