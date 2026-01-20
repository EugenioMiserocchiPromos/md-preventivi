<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\ImportCustomersRequest;
use App\Services\CustomerImportService;
use Illuminate\Http\JsonResponse;

class CustomerImportController extends Controller
{
    public function import(ImportCustomersRequest $request, CustomerImportService $service): JsonResponse
    {
        $result = $service->import($request->file('file'));

        return response()->json($result);
    }
}
