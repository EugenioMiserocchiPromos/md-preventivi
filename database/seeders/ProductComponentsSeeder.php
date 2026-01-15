<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductComponentsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $products = DB::table('products')
            ->whereIn('code', ['001', '002', '003'])
            ->get(['id', 'code'])
            ->keyBy('code');

        $components = [
            [
                'code' => '001',
                'items' => [
                    ['name' => 'Telaio', 'unit_default' => 'pz', 'qty_default' => 1, 'price_default' => 120.00, 'default_visible' => true, 'sort_index' => 1],
                    ['name' => 'Vetro', 'unit_default' => 'mq', 'qty_default' => 1.2, 'price_default' => 80.00, 'default_visible' => true, 'sort_index' => 2],
                ],
            ],
            [
                'code' => '002',
                'items' => [
                    ['name' => 'Telaio', 'unit_default' => 'pz', 'qty_default' => 1, 'price_default' => 160.00, 'default_visible' => true, 'sort_index' => 1],
                    ['name' => 'Maniglia', 'unit_default' => 'pz', 'qty_default' => 1, 'price_default' => 12.00, 'default_visible' => true, 'sort_index' => 2],
                ],
            ],
            [
                'code' => '003',
                'items' => [
                    ['name' => 'Rete', 'unit_default' => 'mq', 'qty_default' => 1, 'price_default' => 25.00, 'default_visible' => true, 'sort_index' => 1],
                    ['name' => 'Guide', 'unit_default' => 'pz', 'qty_default' => 2, 'price_default' => 8.00, 'default_visible' => false, 'sort_index' => 2],
                ],
            ],
        ];

        $insertRows = [];

        foreach ($components as $group) {
            $product = $products->get($group['code']);
            if (! $product) {
                continue;
            }

            foreach ($group['items'] as $item) {
                $insertRows[] = [
                    'product_id' => $product->id,
                    'name' => $item['name'],
                    'unit_default' => $item['unit_default'],
                    'qty_default' => $item['qty_default'],
                    'price_default' => $item['price_default'],
                    'default_visible' => $item['default_visible'],
                    'sort_index' => $item['sort_index'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if ($insertRows) {
            DB::table('product_components')
                ->whereIn('product_id', $products->pluck('id'))
                ->delete();

            DB::table('product_components')->insert($insertRows);
        }
    }
}
