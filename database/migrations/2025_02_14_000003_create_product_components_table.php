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
        Schema::create('product_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('unit_default', 32);
            $table->decimal('qty_default', 12, 2)->nullable();
            $table->decimal('price_default', 12, 2)->nullable();
            $table->boolean('default_visible')->default(true);
            $table->integer('sort_index')->default(0);
            $table->timestamps();

            $table->index('sort_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_components');
    }
};
