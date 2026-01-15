<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $products = [
            ['code' => '001', 'category_name' => 'Serramenti', 'name' => 'Finestra PVC', 'unit_default' => 'pz', 'price_default' => 320.00],
            ['code' => '002', 'category_name' => 'Serramenti', 'name' => 'Porta finestra', 'unit_default' => 'pz', 'price_default' => 450.00],
            ['code' => '003', 'category_name' => 'Zanzariere', 'name' => 'Zanzariera scorrevole', 'unit_default' => 'pz', 'price_default' => 85.00],
            ['code' => '004', 'category_name' => 'Tapparelle', 'name' => 'Tapparella PVC', 'unit_default' => 'mq', 'price_default' => 55.00],
            ['code' => '005', 'category_name' => 'Persiane', 'name' => 'Persiana alluminio', 'unit_default' => 'mq', 'price_default' => 120.00],
            ['code' => '006', 'category_name' => 'Manutenzione', 'name' => 'Sostituzione guarnizioni', 'unit_default' => 'intervento', 'price_default' => 60.00],
            ['code' => '007', 'category_name' => 'Vetri', 'name' => 'Vetro camera', 'unit_default' => 'mq', 'price_default' => 90.00],
            ['code' => '008', 'category_name' => 'Accessori', 'name' => 'Maniglia standard', 'unit_default' => 'pz', 'price_default' => 15.00],
            ['code' => '009', 'category_name' => 'Accessori', 'name' => 'Cerniera rinforzata', 'unit_default' => 'pz', 'price_default' => 22.00],
            ['code' => '010', 'category_name' => 'Posa', 'name' => 'Posa in opera standard', 'unit_default' => 'intervento', 'price_default' => 250.00],
        ];

        $payload = array_map(function ($product) use ($now) {
            return [
                'code' => $product['code'],
                'category_name' => $product['category_name'],
                'name' => $product['name'],
                'unit_default' => $product['unit_default'],
                'price_default' => $product['price_default'],
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }, $products);

        DB::table('products')->upsert($payload, ['code'], [
            'category_name',
            'name',
            'unit_default',
            'price_default',
            'is_active',
            'updated_at',
        ]);
    }
}
