<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuoteRevisionSemanticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_explicit_revision_moves_from_minus_one_to_one(): void
    {
        $quote = $this->makeQuote(-1, '2026-04-20');

        $this->postJson("/api/quotes/{$quote->id}/revision")
            ->assertOk()
            ->assertJson([
                'revision_number' => 1,
                'date' => now()->toDateString(),
            ]);

        $quote->refresh();

        $this->assertSame(1, (int) $quote->revision_number);
        $this->assertStringContainsString('-REV1', (string) $quote->prot_internal);
    }

    public function test_legacy_zero_revision_is_normalized_to_one(): void
    {
        $quote = $this->makeQuote(0, '2026-04-20');

        $this->postJson("/api/quotes/{$quote->id}/revision")
            ->assertOk()
            ->assertJson([
                'revision_number' => 1,
                'date' => now()->toDateString(),
            ]);

        $quote->refresh();

        $this->assertSame(1, (int) $quote->revision_number);
        $this->assertStringContainsString('-REV1', (string) $quote->prot_internal);
    }

    public function test_positive_revision_increments_normally(): void
    {
        $quote = $this->makeQuote(1, '2026-04-20');

        $this->postJson("/api/quotes/{$quote->id}/revision")
            ->assertOk()
            ->assertJson([
                'revision_number' => 2,
                'date' => now()->toDateString(),
            ]);

        $quote->refresh();

        $this->assertSame(2, (int) $quote->revision_number);
        $this->assertStringContainsString('-REV2', (string) $quote->prot_internal);
    }

    private function makeQuote(int $revisionNumber, string $date): Quote
    {
        $user = User::factory()->create([
            'name' => 'Mario',
            'surname' => 'Rossi',
            'initials' => 'MR',
        ]);
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
            'prot_display' => 'MR/FP 0001-26',
            'prot_internal' => 'MR/FP 0001-26',
            'prot_year' => 2026,
            'prot_number' => 1,
            'revision_number' => $revisionNumber,
            'date' => $date,
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
}
