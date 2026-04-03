<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Support\ProductNameHtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductsController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('products')->where('is_active', true);

        $search = trim((string) $request->query('q', ''));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($builder) use ($like) {
                $builder
                    ->where('code', 'like', $like)
                    ->orWhere('name', 'like', $like)
                    ->orWhere('category_name', 'like', $like);
            });
        }

        $perPage = (int) $request->query('per_page', 15);
        $perPage = max(1, min($perPage, 50));

        $products = $query
            ->orderBy('code')
            ->paginate($perPage)
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function categories(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $perPage = (int) $request->query('per_page', 15);
        $perPage = max(1, min($perPage, 50));

        $categoriesQuery = DB::table('products')
            ->where('is_active', true)
            ->whereNotNull('category_name')
            ->where('category_name', '!=', '');

        if ($search !== '') {
            $like = '%'.$search.'%';
            $categoriesQuery->where(function ($query) use ($like) {
                $query
                    ->where('category_name', 'like', $like)
                    ->orWhereExists(function ($subQuery) use ($like) {
                        $subQuery
                            ->select(DB::raw(1))
                            ->from('products as p2')
                            ->whereColumn('p2.category_name', 'products.category_name')
                            ->where('p2.is_active', true)
                            ->where(function ($productQuery) use ($like) {
                                $productQuery
                                    ->where('p2.code', 'like', $like)
                                    ->orWhere('p2.name', 'like', $like);
                            });
                    });
            });
        }

        $categories = $categoriesQuery
            ->select('category_name')
            ->distinct()
            ->orderBy('category_name')
            ->limit($perPage)
            ->get();

        if ($categories->isEmpty()) {
            return response()->json([]);
        }

        $categoryNames = $categories->pluck('category_name')->all();

        $products = DB::table('products')
            ->where('is_active', true)
            ->whereIn('category_name', $categoryNames)
            ->orderBy('category_name')
            ->orderBy('code')
            ->get(['id', 'category_name']);

        $grouped = $products->groupBy('category_name');

        $payload = $categories->map(function ($category) use ($grouped) {
            $items = $grouped->get($category->category_name, collect());
            return [
                'name' => $category->category_name,
                'product_count' => $items->count(),
                'product_ids' => $items->pluck('id')->all(),
            ];
        })->values();

        return response()->json($payload);
    }

    public function update(
        Request $request,
        int $product,
        ProductNameHtmlSanitizer $sanitizer
    )
    {
        $validated = $request->validate([
            'name_html' => ['nullable', 'string', 'max:2000'],
        ]);

        $nameHtml = $sanitizer->sanitize((string) ($validated['name_html'] ?? ''));

        DB::table('products')
            ->where('id', $product)
            ->update([
                'name_html' => $nameHtml === '' ? null : $nameHtml,
                'updated_at' => now(),
            ]);

        $productRow = DB::table('products')->where('id', $product)->first();

        return new ProductResource($productRow);
    }
}
