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
        Schema::table('quote_extras', function (Blueprint $table) {
            $table->string('unit', 16)->default('ml')->after('amount');
            $table->decimal('qty', 12, 2)->default(1)->after('unit');
            $table->decimal('unit_price', 12, 2)->default(0)->after('qty');
            $table->decimal('line_total', 12, 2)->default(0)->after('unit_price');
            $table->text('notes')->nullable()->after('line_total');
            $table->boolean('is_included')->default(true)->after('notes');
            $table->boolean('is_fixed')->default(false)->after('is_included');
            $table->string('fixed_key', 32)->nullable()->after('is_fixed');
        });

        DB::table('quote_extras')->update([
            'qty' => 1,
            'unit_price' => DB::raw('amount'),
            'line_total' => DB::raw('amount'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quote_extras', function (Blueprint $table) {
            $table->dropColumn([
                'unit',
                'qty',
                'unit_price',
                'line_total',
                'notes',
                'is_included',
                'is_fixed',
                'fixed_key',
            ]);
        });
    }
};
