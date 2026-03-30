<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\StoreQuoteRequest;
use App\Http\Requests\Quotes\UpdateQuoteInfoRequest;
use App\Http\Resources\QuoteListResource;
use App\Http\Resources\QuoteResource;
use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteExtra;
use App\Models\QuoteItem;
use App\Models\QuoteItemComponent;
use App\Support\QuoteTypes;
use App\Services\QuotePdfService;
use App\Services\ProtFormatter;
use App\Services\ProtGeneratorService;
use App\Services\QuoteTotalsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuotesController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:'.implode(',', QuoteTypes::values())],
            'q' => ['nullable', 'string'],
            'per_page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Quote::query()->where('quote_type', $validated['type']);

        $search = trim((string) ($validated['q'] ?? ''));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($builder) use ($like) {
                $builder
                    ->where('prot_display', 'like', $like)
                    ->orWhere('title_text', 'like', $like)
                    ->orWhere('customer_title_snapshot', 'like', $like)
                    ->orWhere('cantiere', 'like', $like);
            });
        }

        $perPage = (int) ($validated['per_page'] ?? 20);
        $perPage = max(1, min($perPage, 50));

        $quotes = $query
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return QuoteListResource::collection($quotes);
    }

    public function store(
        StoreQuoteRequest $request,
        ProtGeneratorService $protGenerator
    ) {
        $user = $request->user();
        $data = $request->validated();

        $quote = DB::transaction(function () use ($data, $user, $protGenerator) {
            $customer = Customer::findOrFail($data['customer_id']);

            $prot = $protGenerator->allocateForUser(
                $user,
                $data['quote_type']
            );

            return Quote::create([
                'quote_type' => $data['quote_type'],
                'customer_id' => $customer->id,
                'customer_title_snapshot' => $customer->title,
                'customer_body_snapshot' => $customer->body,
                'customer_email_snapshot' => $customer->email,
                'prot_display' => $prot['prot_display'],
                'prot_internal' => $prot['prot_internal'],
                'prot_year' => $prot['prot_year'],
                'prot_number' => $prot['prot_number'],
                'revision_number' => $prot['revision_number'],
                'date' => $data['date'],
                'cantiere' => $data['cantiere'],
                'title_template_id' => null,
                'title_text' => $data['title_text'],
                'discount_type' => null,
                'discount_value' => null,
                'vat_rate' => $data['vat_rate'] ?? 22,
                'subtotal' => 0,
                'discount_amount' => 0,
                'taxable_total' => 0,
                'vat_amount' => 0,
                'grand_total' => 0,
                'created_by_user_id' => $user->id,
            ]);
        });

        return (new QuoteResource($quote))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Quote $quote)
    {
        $quote->load([
            'items' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
            'items.components' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
        ]);

        return new QuoteResource($quote);
    }

    public function update(Quote $quote, UpdateQuoteInfoRequest $request)
    {
        $data = $request->validated();

        $customer = Customer::findOrFail($data['customer_id']);
        $quote->customer_id = $customer->id;
        $quote->customer_title_snapshot = $customer->title;
        $quote->customer_body_snapshot = $customer->body;
        $quote->customer_email_snapshot = $customer->email;
        $quote->cantiere = $data['cantiere'];
        $quote->title_text = $data['title_text'];
        $quote->save();

        return new QuoteResource($quote->fresh());
    }

    public function revision(Quote $quote, ProtFormatter $formatter, Request $request)
    {
        // Explicit-only: revision_number increments only through this endpoint.
        $updated = DB::transaction(function () use ($quote, $formatter) {
            $locked = Quote::query()
                ->whereKey($quote->id)
                ->lockForUpdate()
                ->firstOrFail();

            $locked->revision_number = (int) $locked->revision_number + 1;
            $locked->prot_internal = $formatter->makeInternalWithInitials(
                $locked->prot_display,
                (int) $locked->revision_number
            );
            $locked->date = now()->toDateString();
            $locked->save();

            return $locked;
        });

        if ($updated->revision_number > 0 && $request->user()) {
            $initials = strtoupper(trim((string) $request->user()->initials));
            if ($initials === '') {
                $initials = strtoupper(substr((string) $request->user()->name, 0, 1).substr((string) $request->user()->surname, 0, 1));
            }
            if ($initials !== '') {
                $updated->prot_internal = $formatter->makeInternalWithInitials(
                    $updated->prot_display,
                    (int) $updated->revision_number,
                    $initials
                );
                $updated->save();
            }
        }

        return new QuoteResource($updated);
    }

    public function pdfFull(Quote $quote, QuotePdfService $pdfService)
    {
        $quote->load([
            'items' => function ($query) {
                $query->orderBy('category_name_snapshot')
                    ->orderBy('sort_index')
                    ->orderBy('id');
            },
            'items.components' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
            'extras' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
        ]);

        $filename = 'Preventivo-'.Str::slug((string) $quote->prot_display).'.pdf';
        $pdf = $pdfService->full($quote);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function duplicate(
        Quote $quote,
        ProtGeneratorService $protGenerator,
        QuoteTotalsService $totalsService,
        Request $request
    ) {
        $validated = $request->validate([
            'quote_type' => ['nullable', 'in:'.implode(',', QuoteTypes::values())],
        ]);

        $quote->load([
            'items' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
            'items.components' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
            'extras' => function ($query) {
                $query->orderBy('sort_index')->orderBy('id');
            },
        ]);

        $user = $request->user();
        $targetQuoteType = $validated['quote_type'] ?? $quote->quote_type;

        $newQuote = DB::transaction(function () use ($quote, $protGenerator, $user, $targetQuoteType) {
            $prot = $protGenerator->allocateForUser($user, $targetQuoteType);

            $newQuote = Quote::create([
                'quote_type' => $targetQuoteType,
                'customer_id' => $quote->customer_id,
                'customer_title_snapshot' => $quote->customer_title_snapshot,
                'customer_body_snapshot' => $quote->customer_body_snapshot,
                'customer_email_snapshot' => $quote->customer_email_snapshot,
                'prot_display' => $prot['prot_display'],
                'prot_internal' => $prot['prot_internal'],
                'prot_year' => $prot['prot_year'],
                'prot_number' => $prot['prot_number'],
                'revision_number' => $prot['revision_number'],
                'date' => $quote->date,
                'cantiere' => $quote->cantiere,
                'title_template_id' => $quote->title_template_id,
                'title_text' => $quote->title_text,
                'discount_type' => $quote->discount_type,
                'discount_value' => $quote->discount_value,
                'vat_rate' => $quote->vat_rate,
                'subtotal' => 0,
                'discount_amount' => 0,
                'taxable_total' => 0,
                'vat_amount' => 0,
                'grand_total' => 0,
                'created_by_user_id' => $user->id,
            ]);

            $itemMap = [];
            foreach ($quote->items as $item) {
                /** @var QuoteItem $item */
                $newItem = $newQuote->items()->create([
                    'product_id' => $item->product_id,
                    'category_name_snapshot' => $item->category_name_snapshot,
                    'product_code_snapshot' => $item->product_code_snapshot,
                    'name_snapshot' => $item->name_snapshot,
                    'name_snapshot_html' => $item->name_snapshot_html,
                    'unit_override' => $item->unit_override,
                    'qty' => $item->qty,
                    'unit_price_override' => $item->unit_price_override,
                    'line_total' => $item->line_total,
                    'note_shared' => $item->note_shared,
                    'sort_index' => $item->sort_index,
                ]);
                $itemMap[$item->id] = $newItem;

                foreach ($item->components as $component) {
                    /** @var QuoteItemComponent $component */
                    $newItem->components()->create([
                        'name_snapshot' => $component->name_snapshot,
                        'unit_override' => $component->unit_override,
                        'qty' => $component->qty,
                        'unit_price_override' => $component->unit_price_override,
                        'component_total' => $component->component_total,
                        'is_visible' => $component->is_visible,
                        'sort_index' => $component->sort_index,
                    ]);
                }
            }

            foreach ($quote->extras as $extra) {
                /** @var QuoteExtra $extra */
                $newQuote->extras()->create([
                    'description' => $extra->description,
                    'amount' => $extra->amount,
                    'unit' => $extra->unit,
                    'qty' => $extra->qty,
                    'unit_price' => $extra->unit_price,
                    'line_total' => $extra->line_total,
                    'notes' => $extra->notes,
                    'is_included' => $extra->is_included,
                    'is_fixed' => $extra->is_fixed,
                    'fixed_key' => $extra->fixed_key,
                    'sort_index' => $extra->sort_index,
                ]);
            }

            return $newQuote;
        });

        $totalsService->recalculateAndPersist($newQuote->fresh());

        return new QuoteResource($newQuote->fresh());
    }

    public function destroy(Quote $quote)
    {
        DB::transaction(function () use ($quote) {
            $quote->items()->each(function ($item) {
                $item->components()->delete();
            });
            $quote->items()->delete();
            $quote->extras()->delete();
            $quote->delete();
        });

        return response()->noContent();
    }
}
