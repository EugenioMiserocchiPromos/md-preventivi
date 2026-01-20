<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerImportService
{
    private const REQUIRED_FIELDS = ['title', 'body'];

    private const HEADER_ALIASES = [
        'title' => 'title',
        'titolo' => 'title',
        'nome' => 'title',
        'ragione_sociale' => 'title',
        'body' => 'body',
        'anagrafica' => 'body',
        'indirizzo' => 'body',
        'dati' => 'body',
        'dettagli' => 'body',
        'email' => 'email',
        'mail' => 'email',
        'e_mail' => 'email',
    ];

    public function import(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (! $handle) {
            return $this->errorResult('Impossibile leggere il file.');
        }

        $firstLine = fgets($handle);
        if ($firstLine === false) {
            fclose($handle);

            return $this->errorResult('Header CSV mancante.');
        }

        $commaCount = substr_count($firstLine, ',');
        $semicolonCount = substr_count($firstLine, ';');
        $delimiter = $semicolonCount > $commaCount ? ';' : ',';
        rewind($handle);

        $headerRow = fgetcsv($handle, 0, $delimiter);
        if (! $headerRow) {
            fclose($handle);

            return $this->errorResult('Header CSV mancante.');
        }

        $headerMap = $this->mapHeaders($headerRow);
        $missing = array_diff(self::REQUIRED_FIELDS, array_values($headerMap));
        if ($missing) {
            fclose($handle);

            return $this->errorResult('Header richiesti mancanti: '.implode(', ', $missing));
        }

        $result = [
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => [],
        ];

        $rowIndex = 1;
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rowIndex++;
            if ($this->rowIsEmpty($row)) {
                continue;
            }

            $mapped = $this->mapRow($row, $headerMap);
            $normalized = $this->normalizeRow($mapped);

            if (! $normalized['valid']) {
                $result['skipped']++;
                $result['errors'][] = ['row' => $rowIndex, 'message' => $normalized['message']];
                continue;
            }

            $title = $normalized['title'];
            $payload = [
                'title' => $title,
                'body' => $normalized['body'],
                'email' => $normalized['email'],
                'updated_at' => now(),
            ];

            $existing = DB::table('customers')
                ->whereRaw('LOWER(title) = ?', [Str::lower($title)])
                ->first();

            if ($existing) {
                DB::table('customers')->where('id', $existing->id)->update($payload);
                $result['updated']++;
            } else {
                $payload['created_at'] = now();
                DB::table('customers')->insert($payload);
                $result['created']++;
            }
        }

        fclose($handle);

        return $result;
    }

    private function errorResult(string $message): array
    {
        return [
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => [['row' => 0, 'message' => $message]],
        ];
    }

    private function mapHeaders(array $headerRow): array
    {
        $map = [];

        foreach ($headerRow as $index => $header) {
            $normalized = $this->normalizeHeader($header);
            $field = self::HEADER_ALIASES[$normalized] ?? null;
            if ($field) {
                $map[$index] = $field;
            }
        }

        return $map;
    }

    private function normalizeHeader(string $header): string
    {
        $header = Str::ascii($header);
        $header = Str::of($header)->lower()->trim();
        $header = str_replace(['-', ' '], '_', $header);
        $header = preg_replace('/[^a-z0-9_]+/', '_', $header);
        $header = preg_replace('/_+/', '_', $header);
        return trim($header, '_');
    }

    private function mapRow(array $row, array $headerMap): array
    {
        $mapped = [];

        foreach ($headerMap as $index => $field) {
            $mapped[$field] = $row[$index] ?? null;
        }

        return $mapped;
    }

    private function normalizeRow(array $data): array
    {
        $title = trim((string) ($data['title'] ?? ''));
        $body = trim((string) ($data['body'] ?? ''));
        $emailRaw = trim((string) ($data['email'] ?? ''));

        if ($title === '' || $body === '') {
            return ['valid' => false, 'message' => 'Campi obbligatori mancanti.'];
        }

        $body = str_replace(["\u{2028}", "\u{2029}"], "\n", $body);

        $email = null;
        if ($emailRaw !== '') {
            $tokens = preg_split('/[;,]/', $emailRaw) ?: [];
            $tokens = array_values(array_filter(array_map('trim', $tokens), static fn ($value) => $value !== ''));
            $email = $tokens ? implode(', ', $tokens) : null;
        }

        return [
            'valid' => true,
            'title' => $title,
            'body' => $body,
            'email' => $email,
        ];
    }

    private function rowIsEmpty(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }
}
