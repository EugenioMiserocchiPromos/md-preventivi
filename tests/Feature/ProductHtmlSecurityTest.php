<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProductHtmlSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_manual_product_html_update_is_sanitized(): void
    {
        $user = User::factory()->create();

        $productId = DB::table('products')->insertGetId([
            'code' => '001',
            'category_name' => 'Impermeabilizzazione',
            'name' => 'Prodotto demo',
            'name_html' => null,
            'unit_default' => 'mq',
            'price_default' => 10,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->patchJson("/api/products/{$productId}", [
                'name_html' => '<img src=x onerror=alert(1)><strong class="x">Penetron</strong>',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name_html', '<strong>Penetron</strong>');

        $this->assertSame(
            '<strong>Penetron</strong>',
            DB::table('products')->where('id', $productId)->value('name_html')
        );
    }

    public function test_product_import_sanitizes_name_html_before_persisting(): void
    {
        $user = User::factory()->create();

        $csv = implode("\n", [
            'categoria,nome,um,prezzo',
            'Impermeabilizzazione,"<img src=x onerror=alert(1)><strong>Penetron</strong>",mq,10',
        ]);

        $file = UploadedFile::fake()->createWithContent('products.csv', $csv);

        $response = $this
            ->actingAs($user)
            ->post('/api/products/import', [
                'file' => $file,
            ], [
                'Accept' => 'application/json',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('created', 1);

        $this->assertDatabaseHas('products', [
            'code' => '001',
            'name_html' => '<strong>Penetron</strong>',
        ]);
    }
}
