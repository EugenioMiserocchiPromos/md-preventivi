<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuoteTitleTemplateResource;
use Illuminate\Support\Facades\DB;

class QuoteTitleTemplatesController extends Controller
{
    public function index()
    {
        $templates = DB::table('quote_title_templates')
            ->where('is_active', true)
            ->orderBy('sort_index')
            ->orderBy('id')
            ->get();

        return QuoteTitleTemplateResource::collection($templates);
    }
}
