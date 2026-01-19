<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProtGeneratorService
{
    public function allocateForUser(User $user, string $quoteType, ?int $year = null): array
    {
        $year = $year ?? (int) now()->format('Y');
        $initials = $this->resolveInitials($user);
        $quoteType = strtoupper($quoteType);
        $formatter = new ProtFormatter();

        return DB::transaction(function () use ($year, $initials, $quoteType, $formatter) {
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

            $protDisplay = $formatter->makeDisplay($initials, $quoteType, $nextNumber, $year);
            $protInternal = $formatter->makeInternal($protDisplay, 1);

            return [
                'prot_year' => $year,
                'prot_number' => $nextNumber,
                'revision_number' => 1,
                'prot_display' => $protDisplay,
                'prot_internal' => $protInternal,
            ];
        });
    }

    private function resolveInitials(User $user): string
    {
        $name = trim((string) $user->name);
        $surname = trim((string) $user->surname);

        if ($name !== '' && $surname !== '') {
            return strtoupper(substr($name, 0, 1).substr($surname, 0, 1));
        }

        $fallback = trim((string) $user->initials);

        return $fallback !== '' ? strtoupper($fallback) : 'NA';
    }
}
