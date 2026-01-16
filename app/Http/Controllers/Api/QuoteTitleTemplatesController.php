<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quotes\StoreQuoteTitleTemplateRequest;
use App\Http\Requests\Quotes\UpdateQuoteTitleTemplateRequest;
use App\Http\Resources\QuoteTitleTemplateResource;
use Illuminate\Support\Facades\DB;

class QuoteTitleTemplatesController extends Controller
{
    public function index()
    {
        $templates = DB::table('quote_title_templates')
            ->orderBy('label')
            ->orderBy('id')
            ->get();

        return QuoteTitleTemplateResource::collection($templates);
    }

    public function store(StoreQuoteTitleTemplateRequest $request)
    {
        $data = $request->validated();
        $sortIndex = (int) (DB::table('quote_title_templates')->max('sort_index') ?? 0) + 1;

        $id = DB::table('quote_title_templates')->insertGetId([
            'label' => $data['label'],
            'is_active' => true,
            'sort_index' => $sortIndex,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $template = DB::table('quote_title_templates')->where('id', $id)->first();

        return (new QuoteTitleTemplateResource($template))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateQuoteTitleTemplateRequest $request, int $template)
    {
        $data = $request->validated();
        $payload = [
            'label' => $data['label'],
            'is_active' => true,
            'updated_at' => now(),
        ];

        DB::table('quote_title_templates')->where('id', $template)->update($payload);
        $updated = DB::table('quote_title_templates')->where('id', $template)->first();

        return new QuoteTitleTemplateResource($updated);
    }

    public function destroy(int $template)
    {
        $inUse = DB::table('quotes')->where('title_template_id', $template)->exists();
        if ($inUse) {
            return response()->json([
                'message' => 'Template in uso: non può essere eliminato.',
            ], 409);
        }

        DB::table('quote_title_templates')->where('id', $template)->delete();

        return response()->noContent();
    }
}
