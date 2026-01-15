<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
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
}
