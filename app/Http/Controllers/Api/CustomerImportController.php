<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\ImportCustomersRequest;
use App\Services\CustomerImportService;
use App\Services\ImportFileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerImportController extends Controller
{
    public function import(
        ImportCustomersRequest $request,
        CustomerImportService $service,
        ImportFileService $importFiles
    ): JsonResponse
    {
        $result = $service->import($request->file('file'));
        $latestFile = null;

        if (($result['accepted'] ?? false) === true) {
            try {
                $latestFile = $importFiles->replaceLatest(
                    ImportFileService::TYPE_CUSTOMERS,
                    $request->file('file'),
                    $request->user()?->id
                );
            } catch (\Throwable $exception) {
                Log::warning('customers_import_file_store_failed', [
                    'user_id' => $request->user()?->id,
                    'ip' => $request->ip(),
                    'error' => $exception->getMessage(),
                ]);

                $result['warning'] = 'Import riuscito, ma l’ultimo file non è stato salvato.';
            }
        }

        Log::info('customers_import_completed', [
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
            'original_name' => $request->file('file')?->getClientOriginalName(),
            'created' => $result['created'] ?? 0,
            'updated' => $result['updated'] ?? 0,
            'skipped' => $result['skipped'] ?? 0,
            'error_count' => count($result['errors'] ?? []),
        ]);

        return response()->json([
            ...$result,
            'latest_file' => $latestFile,
        ]);
    }

    public function latest(ImportFileService $importFiles): JsonResponse
    {
        $latestFile = $importFiles->latestMetadata(ImportFileService::TYPE_CUSTOMERS);

        if (! $latestFile) {
            return response()->json(['message' => 'Nessun import disponibile.'], 404);
        }

        return response()->json($latestFile, 200);
    }

    public function downloadLatest(ImportFileService $importFiles): StreamedResponse
    {
        return $importFiles->downloadLatest(ImportFileService::TYPE_CUSTOMERS);
    }
}
