<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();

            $table->string('category_name_snapshot');
            $table->char('product_code_snapshot', 3);
            $table->string('name_snapshot');

            $table->string('unit_override', 32);
            $table->decimal('qty', 12, 2)->default(0);
            $table->decimal('unit_price_override', 12, 2)->default(0);
            $table->decimal('line_total', 12, 2)->default(0);

            $table->text('note_shared')->nullable();
            $table->integer('sort_index')->default(0);
            $table->timestamps();

            $table->index('quote_id');
            $table->index('sort_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_items');
    }
};
