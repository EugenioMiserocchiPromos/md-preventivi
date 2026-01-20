<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\StoreQuoteRequest;
use App\Http\Resources\QuoteListResource;
use App\Http\Resources\QuoteResource;
use App\Models\Customer;
use App\Models\Quote;
use App\Services\ProtFormatter;
use App\Services\ProtGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuotesController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:FP,AS,VM'],
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
            $template = DB::table('quote_title_templates')
                ->where('id', $data['title_template_id'])
                ->first();
            if (! $template) {
                abort(422, 'Template titolo non valido.');
            }

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
                'title_template_id' => $template->id,
                'title_text' => $template->label,
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

    public function revision(Quote $quote, ProtFormatter $formatter)
    {
        // Explicit-only: revision_number increments only through this endpoint.
        $updated = DB::transaction(function () use ($quote, $formatter) {
            $locked = Quote::query()
                ->whereKey($quote->id)
                ->lockForUpdate()
                ->firstOrFail();

            $locked->revision_number = (int) $locked->revision_number + 1;
            $locked->prot_internal = $formatter->makeInternal(
                $locked->prot_display,
                (int) $locked->revision_number
            );
            $locked->date = now()->toDateString();
            $locked->save();

            return $locked;
        });

        return new QuoteResource($updated);
    }
}
