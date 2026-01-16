<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $duplicates = DB::table('quote_title_templates')
            ->select('label')
            ->groupBy('label')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('label');

        foreach ($duplicates as $label) {
            $keepId = DB::table('quote_title_templates')
                ->where('label', $label)
                ->min('id');

            DB::table('quote_title_templates')
                ->where('label', $label)
                ->where('id', '!=', $keepId)
                ->delete();
        }

        Schema::table('quote_title_templates', function (Blueprint $table) {
            $table->unique('label');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quote_title_templates', function (Blueprint $table) {
            $table->dropUnique(['label']);
        });
    }
};
