<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductComponentResource;
use Illuminate\Support\Facades\DB;

class ProductComponentsController extends Controller
{
    public function index(int $product)
    {
        $exists = DB::table('products')->where('id', $product)->exists();
        if (! $exists) {
            abort(404);
        }

        $components = DB::table('product_components')
            ->where('product_id', $product)
            ->orderBy('sort_index')
            ->orderBy('id')
            ->get();

        return ProductComponentResource::collection($components);
    }
}
