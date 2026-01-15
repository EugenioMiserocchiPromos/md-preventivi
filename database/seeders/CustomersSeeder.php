<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomersSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $customers = [
            [
                'title' => 'Edil Casa Srl',
                'body' => "Edil Casa Srl\nVia Roma 10\n20100 Milano (MI)",
                'email' => 'info@edilcasa.test',
            ],
            [
                'title' => 'Condominio Aurora',
                'body' => "Amministrazione Aurora\nViale Europa 42\n00100 Roma (RM)",
                'email' => 'amministrazione@aurora.test',
            ],
            [
                'title' => 'Ferramenta Riva',
                'body' => "Ferramenta Riva\nCorso Italia 5\n16100 Genova (GE)",
                'email' => 'contatti@riva.test',
            ],
        ];

        foreach ($customers as $customer) {
            DB::table('customers')->updateOrInsert(
                ['title' => $customer['title']],
                [
                    'body' => $customer['body'],
                    'email' => $customer['email'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
