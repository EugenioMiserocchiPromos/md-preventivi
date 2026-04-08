<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportFileService
{
    public const TYPE_PRODUCTS = 'products';

    public const TYPE_PRODUCT_COMPONENTS = 'product_components';

    public const TYPE_CUSTOMERS = 'customers';

    public function replaceLatest(string $type, UploadedFile $file, ?int $userId = null): array
    {
        $disk = 'local';
        $existing = $this->findLatest($type);
        $extension = strtolower((string) $file->getClientOriginalExtension());
        $extension = $extension !== '' ? $extension : 'csv';
        $storedPath = $file->storeAs(
            "imports/{$type}",
            now()->format('Ymd_His').'_'.Str::random(12).'.'.$extension,
            $disk
        );

        if (! is_string($storedPath) || $storedPath === '') {
            throw new RuntimeException('Impossibile salvare il file importato.');
        }

        $now = now();
        $payload = [
            'disk' => $disk,
            'path' => $storedPath,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'uploaded_by_user_id' => $userId,
            'imported_at' => $now,
            'updated_at' => $now,
        ];

        try {
            DB::transaction(function () use ($type, $payload, $now) {
                $record = DB::table('import_files')->where('type', $type)->first();

                if ($record) {
                    DB::table('import_files')
                        ->where('id', $record->id)
                        ->update($payload);

                    return;
                }

                DB::table('import_files')->insert([
                    'type' => $type,
                    ...$payload,
                    'created_at' => $now,
                ]);
            });
        } catch (\Throwable $exception) {
            Storage::disk($disk)->delete($storedPath);

            throw $exception;
        }

        if ($existing && $existing->path !== $storedPath) {
            Storage::disk((string) $existing->disk)->delete((string) $existing->path);
        }

        return $this->formatMetadata((object) [
            'type' => $type,
            ...$payload,
        ]);
    }

    public function latestMetadata(string $type): ?array
    {
        $record = $this->findLatest($type);

        return $record ? $this->formatMetadata($record) : null;
    }

    public function downloadLatest(string $type): StreamedResponse
    {
        $record = $this->findLatest($type);

        if (! $record) {
            abort(404, 'Nessun import disponibile.');
        }

        if (! Storage::disk((string) $record->disk)->exists((string) $record->path)) {
            abort(404, 'File importato non disponibile.');
        }

        return Storage::disk((string) $record->disk)->download(
            (string) $record->path,
            (string) $record->original_name,
            [
                'Content-Type' => (string) ($record->mime_type ?: 'text/csv'),
            ]
        );
    }

    private function findLatest(string $type): ?object
    {
        return DB::table('import_files')->where('type', $type)->first();
    }

    private function formatMetadata(object $record): array
    {
        return [
            'type' => (string) $record->type,
            'original_name' => (string) $record->original_name,
            'size_bytes' => $record->size_bytes === null ? null : (int) $record->size_bytes,
            'imported_at' => (string) $record->imported_at,
        ];
    }
}
