<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\ImportProductComponentsRequest;
use App\Services\ProductComponentsImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProductComponentsImportController extends Controller
{
    public function import(
        ImportProductComponentsRequest $request,
        ProductComponentsImportService $service
    ): JsonResponse {
        $result = $service->import($request->file('file'));

        Log::info('product_components_import_completed', [
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
            'created' => $result['created'] ?? 0,
            'skipped' => $result['skipped'] ?? 0,
            'error_count' => count($result['errors'] ?? []),
        ]);

        return response()->json($result, 200);
    }
}
