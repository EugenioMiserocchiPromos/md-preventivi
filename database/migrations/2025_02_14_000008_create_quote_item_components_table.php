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
        Schema::create('quote_item_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_item_id')->constrained()->cascadeOnDelete();
            $table->string('name_snapshot');
            $table->string('unit_override', 32);
            $table->decimal('qty', 12, 2)->default(0);
            $table->decimal('unit_price_override', 12, 2)->default(0);
            $table->decimal('component_total', 12, 2)->default(0);
            $table->boolean('is_visible')->default(true);
            $table->integer('sort_index')->default(0);
            $table->timestamps();

            $table->index('quote_item_id');
            $table->index('sort_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_item_components');
    }
};
