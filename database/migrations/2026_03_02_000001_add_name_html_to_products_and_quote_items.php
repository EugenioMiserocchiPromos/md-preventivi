<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->text('name_html')->nullable()->after('name');
        });

        Schema::table('quote_items', function (Blueprint $table) {
            $table->text('name_snapshot_html')->nullable()->after('name_snapshot');
        });

        DB::table('products')
            ->whereNull('name_html')
            ->update(['name_html' => DB::raw('name')]);

        DB::table('quote_items')
            ->whereNull('name_snapshot_html')
            ->update(['name_snapshot_html' => DB::raw('name_snapshot')]);
    }

    public function down(): void
    {
        Schema::table('quote_items', function (Blueprint $table) {
            $table->dropColumn('name_snapshot_html');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('name_html');
        });
    }
};
