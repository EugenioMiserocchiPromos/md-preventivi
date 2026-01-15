<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\ImportProductsRequest;
use App\Services\ProductImportService;
use Illuminate\Http\JsonResponse;

class ProductImportController extends Controller
{
    public function import(ImportProductsRequest $request, ProductImportService $service): JsonResponse
    {
        $result = $service->import($request->file('file'));

        return response()->json($result, 200);
    }
}
