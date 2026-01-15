<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuotesSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        $customer = Customer::first();

        if (! $user || ! $customer) {
            return;
        }

        Quote::updateOrCreate(
            ['prot_internal' => 'MD/FP 0001-26-REV1'],
            [
                'quote_type' => 'FP',
                'customer_id' => $customer->id,
                'customer_title_snapshot' => $customer->title,
                'customer_body_snapshot' => $customer->body,
                'customer_email_snapshot' => $customer->email,
                'prot_display' => 'MD/FP 0001-26',
                'prot_internal' => 'MD/FP 0001-26-REV1',
                'prot_year' => 2026,
                'prot_number' => 1,
                'revision_number' => 1,
                'date' => now()->toDateString(),
                'cantiere' => 'Demo',
                'title_text' => 'Preventivo demo',
                'discount_type' => null,
                'discount_value' => null,
                'vat_rate' => 22,
                'subtotal' => 0,
                'discount_amount' => 0,
                'taxable_total' => 0,
                'vat_amount' => 0,
                'grand_total' => 0,
                'created_by_user_id' => $user->id,
            ]
        );
    }
}
