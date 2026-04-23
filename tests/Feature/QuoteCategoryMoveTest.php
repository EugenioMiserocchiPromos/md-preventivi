<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuoteCategoryMoveTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_moves_a_category_block_up_and_preserves_internal_item_order(): void
    {
        $quote = $this->makeQuote();

        $this->makeQuoteItem($quote->id, 1, 'Cat A', '001', 0);
        $this->makeQuoteItem($quote->id, 2, 'Cat A', '002', 1);
        $this->makeQuoteItem($quote->id, 3, 'Cat B', '003', 2);
        $this->makeQuoteItem($quote->id, 4, 'Cat B', '004', 3);
        $this->makeQuoteItem($quote->id, 5, 'Cat C', '005', 4);

        $response = $this->postJson("/api/quotes/{$quote->id}/items/category/move", [
            'category_name' => 'Cat B',
            'direction' => 'up',
        ]);

        $response
            ->assertOk()
            ->assertJson(['moved' => true]);

        $ordered = DB::table('quote_items')
            ->where('quote_id', $quote->id)
            ->orderBy('sort_index')
            ->pluck('product_code_snapshot')
            ->all();

        $this->assertSame(['003', '004', '001', '002', '005'], $ordered);
    }

    public function test_it_returns_moved_false_when_trying_to_move_the_first_category_up(): void
    {
        $quote = $this->makeQuote();

        $this->makeQuoteItem($quote->id, 1, 'Cat A', '001', 0);
        $this->makeQuoteItem($quote->id, 2, 'Cat B', '002', 1);

        $response = $this->postJson("/api/quotes/{$quote->id}/items/category/move", [
            'category_name' => 'Cat A',
            'direction' => 'up',
        ]);

        $response
            ->assertOk()
            ->assertJson(['moved' => false]);

        $ordered = DB::table('quote_items')
            ->where('quote_id', $quote->id)
            ->orderBy('sort_index')
            ->pluck('product_code_snapshot')
            ->all();

        $this->assertSame(['001', '002'], $ordered);
    }

    public function test_it_returns_not_found_for_a_category_not_present_in_the_quote(): void
    {
        $quote = $this->makeQuote();

        $this->makeQuoteItem($quote->id, 1, 'Cat A', '001', 0);

        $this->postJson("/api/quotes/{$quote->id}/items/category/move", [
            'category_name' => 'Cat X',
            'direction' => 'down',
        ])->assertStatus(404);
    }

    private function makeQuote(): Quote
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $customer = Customer::create([
            'title' => 'Cliente Test',
            'body' => 'Via Test 1',
            'email' => 'cliente@example.test',
        ]);

        return Quote::create([
            'quote_type' => 'FP',
            'customer_id' => $customer->id,
            'customer_title_snapshot' => $customer->title,
            'customer_body_snapshot' => $customer->body,
            'customer_email_snapshot' => $customer->email,
            'prot_display' => '25-0001',
            'prot_internal' => '25-0001-AB',
            'prot_year' => 2025,
            'prot_number' => 1,
            'revision_number' => 0,
            'date' => '2026-04-23',
            'cantiere' => 'Cantiere test',
            'title_text' => 'Preventivo test',
            'discount_type' => null,
            'discount_value' => null,
            'vat_rate' => 22,
            'subtotal' => 0,
            'discount_amount' => 0,
            'taxable_total' => 0,
            'vat_amount' => 0,
            'grand_total' => 0,
            'created_by_user_id' => $user->id,
        ]);
    }

    private function makeQuoteItem(
        int $quoteId,
        int $productId,
        string $categoryName,
        string $code,
        int $sortIndex
    ): void {
        DB::table('products')->insert([
            'id' => $productId,
            'code' => $code,
            'category_name' => $categoryName,
            'name' => "Prodotto {$code}",
            'unit_default' => 'pz',
            'price_default' => 10,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('quote_items')->insert([
            'quote_id' => $quoteId,
            'product_id' => $productId,
            'category_name_snapshot' => $categoryName,
            'product_code_snapshot' => $code,
            'name_snapshot' => "Prodotto {$code}",
            'name_snapshot_html' => "Prodotto {$code}",
            'unit_override' => 'pz',
            'qty' => 1,
            'unit_price_override' => 10,
            'line_total' => 10,
            'note_shared' => null,
            'sort_index' => $sortIndex,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
