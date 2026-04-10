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
        if (Schema::hasTable('quotes') && Schema::hasColumn('quotes', 'title_template_id')) {
            Schema::table('quotes', function (Blueprint $table) {
                $table->dropConstrainedForeignId('title_template_id');
            });
        }

        Schema::dropIfExists('quote_title_templates');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('quote_title_templates')) {
            Schema::create('quote_title_templates', function (Blueprint $table) {
                $table->id();
                $table->string('label')->unique();
                $table->boolean('is_active')->default(true);
                $table->integer('sort_index')->default(0);
                $table->timestamps();
            });
        }

        if (Schema::hasTable('quotes') && ! Schema::hasColumn('quotes', 'title_template_id')) {
            Schema::table('quotes', function (Blueprint $table) {
                $table->foreignId('title_template_id')
                    ->nullable()
                    ->after('cantiere')
                    ->constrained('quote_title_templates');
            });
        }
    }
};
