<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\ImportCustomersRequest;
use App\Services\CustomerImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class CustomerImportController extends Controller
{
    public function import(ImportCustomersRequest $request, CustomerImportService $service): JsonResponse
    {
        $result = $service->import($request->file('file'));

        Log::info('customers_import_completed', [
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
            'created' => $result['created'] ?? 0,
            'updated' => $result['updated'] ?? 0,
            'skipped' => $result['skipped'] ?? 0,
            'error_count' => count($result['errors'] ?? []),
        ]);

        return response()->json($result);
    }
}
