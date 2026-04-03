<?php

use App\Support\ProductNameHtmlSanitizer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $sanitizer = new ProductNameHtmlSanitizer();

        DB::table('products')
            ->select(['id', 'name_html'])
            ->whereNotNull('name_html')
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($sanitizer) {
                foreach ($rows as $row) {
                    $sanitized = $sanitizer->sanitize((string) $row->name_html);

                    DB::table('products')
                        ->where('id', $row->id)
                        ->update([
                            'name_html' => $sanitized === '' ? null : $sanitized,
                            'updated_at' => now(),
                        ]);
                }
            });

        DB::table('quote_items')
            ->select(['id', 'name_snapshot_html'])
            ->whereNotNull('name_snapshot_html')
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($sanitizer) {
                foreach ($rows as $row) {
                    $sanitized = $sanitizer->sanitize((string) $row->name_snapshot_html);

                    DB::table('quote_items')
                        ->where('id', $row->id)
                        ->update([
                            'name_snapshot_html' => $sanitized === '' ? null : $sanitized,
                            'updated_at' => now(),
                        ]);
                }
            });
    }

    public function down(): void
    {
        // Data cleanup only: no safe automatic rollback.
    }
};
