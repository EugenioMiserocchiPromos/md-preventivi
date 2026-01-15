<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\ImportProductComponentsRequest;
use App\Services\ProductComponentsImportService;
use Illuminate\Http\JsonResponse;

class ProductComponentsImportController extends Controller
{
    public function import(
        ImportProductComponentsRequest $request,
        ProductComponentsImportService $service
    ): JsonResponse {
        $result = $service->import($request->file('file'));

        return response()->json($result, 200);
    }
}
