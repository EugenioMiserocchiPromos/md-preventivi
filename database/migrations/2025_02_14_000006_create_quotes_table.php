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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->char('quote_type', 2);
            $table->foreignId('customer_id')->constrained();
            $table->string('customer_title_snapshot');
            $table->text('customer_body_snapshot');
            $table->string('customer_email_snapshot')->nullable();

            $table->string('prot_display', 32);
            $table->string('prot_internal', 40);
            $table->smallInteger('prot_year');
            $table->integer('prot_number');
            $table->integer('revision_number');

            $table->date('date');
            $table->string('cantiere');
            $table->foreignId('title_template_id')->nullable()->constrained('quote_title_templates');
            $table->string('title_text');

            $table->string('discount_type', 16)->nullable();
            $table->decimal('discount_value', 12, 2)->nullable();
            $table->decimal('vat_rate', 5, 2)->default(22.00);

            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('taxable_total', 12, 2)->default(0);
            $table->decimal('vat_amount', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);

            $table->foreignId('created_by_user_id')->constrained('users');
            $table->timestamps();

            $table->unique(['prot_year', 'prot_number']);
            $table->index('quote_type');
            $table->index('customer_id');
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
