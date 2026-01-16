<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuoteTitleTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('quote_title_templates')->exists()) {
            return;
        }

        $now = now();

        $templates = [
            ['label' => 'Fornitura e posa infissi', 'sort_index' => 1],
            ['label' => 'Manutenzione straordinaria', 'sort_index' => 2],
            ['label' => 'Preventivo materiali', 'sort_index' => 3],
        ];

        $payload = array_map(function ($item) use ($now) {
            return [
                'label' => $item['label'],
                'is_active' => true,
                'sort_index' => $item['sort_index'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }, $templates);

        DB::table('quote_title_templates')->upsert(
            $payload,
            ['label'],
            ['is_active', 'sort_index', 'updated_at']
        );
    }
}
