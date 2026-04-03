<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\ImportProductsRequest;
use App\Services\ProductImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProductImportController extends Controller
{
    public function import(ImportProductsRequest $request, ProductImportService $service): JsonResponse
    {
        $result = $service->import($request->file('file'));

        Log::info('products_import_completed', [
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
            'created' => $result['created'] ?? 0,
            'updated' => $result['updated'] ?? 0,
            'skipped' => $result['skipped'] ?? 0,
            'error_count' => count($result['errors'] ?? []),
        ]);

        return response()->json($result, 200);
    }
}
