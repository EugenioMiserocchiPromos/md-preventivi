<?php

namespace App\Services;

use App\Support\Units;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductImportService
{
    private const REQUIRED_FIELDS = ['category_name', 'name', 'unit_default', 'price_default'];

    private const HEADER_ALIASES = [
        'code' => 'code',
        'cod' => 'code',
        'codice' => 'code',
        'codice_articolo' => 'code',
        'codice_prodotto' => 'code',
        'articolo' => 'code',
        'product_code' => 'code',
        'category' => 'category_name',
        'categoria' => 'category_name',
        'famiglia' => 'category_name',
        'gruppo' => 'category_name',
        'reparto' => 'category_name',
        'category_name' => 'category_name',
        'nome_categoria' => 'category_name',
        'name' => 'name',
        'descrizione' => 'name',
        'nome' => 'name',
        'prodotto' => 'name',
        'articolo_descrizione' => 'name',
        'unit' => 'unit_default',
        'um' => 'unit_default',
        'u_m' => 'unit_default',
        'unita' => 'unit_default',
        'unita_di_misura' => 'unit_default',
        'unit_default' => 'unit_default',
        'price' => 'price_default',
        'prezzo' => 'price_default',
        'prezzo_unitario' => 'price_default',
        'prezzo_euro' => 'price_default',
        'listino' => 'price_default',
        'price_default' => 'price_default',
        'note' => 'note_default',
        'notes' => 'note_default',
        'nota' => 'note_default',
        'note_default' => 'note_default',
    ];

    public function import(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (! $handle) {
            return [
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => [['row' => 0, 'message' => 'Impossibile leggere il file.']],
            ];
        }

        $firstLine = fgets($handle);
        if ($firstLine === false) {
            fclose($handle);

            return [
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => [['row' => 0, 'message' => 'Header CSV mancante.']],
            ];
        }

        $commaCount = substr_count($firstLine, ',');
        $semicolonCount = substr_count($firstLine, ';');
        $delimiter = $semicolonCount > $commaCount ? ';' : ',';
        rewind($handle);

        $headerRow = fgetcsv($handle, 0, $delimiter);
        if (! $headerRow) {
            fclose($handle);

            return [
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => [['row' => 0, 'message' => 'Header CSV mancante.']],
            ];
        }

        $headerMap = $this->mapHeaders($headerRow);
        $missing = array_diff(self::REQUIRED_FIELDS, array_values($headerMap));
        if ($missing) {
            fclose($handle);

            return [
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => [[
                    'row' => 0,
                    'message' => 'Header richiesti mancanti: '.implode(', ', $missing),
                ]],
            ];
        }

        $maxCode = (int) (DB::table('products')
            ->selectRaw('MAX(CAST(code AS UNSIGNED)) as max_code')
            ->value('max_code') ?? 0);
        $nextCode = $maxCode + 1;
        $seenCodes = [];

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

            $data = $this->mapRow($row, $headerMap);
            $normalized = $this->normalizeRow($data);

            if (! $normalized['valid']) {
                $result['skipped']++;
                $result['errors'][] = ['row' => $rowIndex, 'message' => $normalized['message']];
                continue;
            }

            $code = $normalized['code'];
            if ($code) {
                if (isset($seenCodes[$code])) {
                    $result['skipped']++;
                    $result['errors'][] = ['row' => $rowIndex, 'message' => "Codice duplicato nel file: {$code}"];
                    continue;
                }
                $seenCodes[$code] = true;
            } else {
                $code = $this->generateCode($nextCode, $seenCodes);
                $nextCode++;
                $seenCodes[$code] = true;
            }

            $payload = [
                'code' => $code,
                'category_name' => $normalized['category_name'],
                'name' => $normalized['name'],
                'unit_default' => $normalized['unit_default'],
                'price_default' => $normalized['price_default'],
                'note_default' => $normalized['note_default'] ?? null,
                'is_active' => true,
                'updated_at' => now(),
            ];

            $existing = DB::table('products')->where('code', $code)->first();
            if ($existing) {
                DB::table('products')->where('code', $code)->update($payload);
                $result['updated']++;
            } else {
                $payload['created_at'] = now();
                DB::table('products')->insert($payload);
                $result['created']++;
            }
        }

        fclose($handle);

        return $result;
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
        $code = isset($data['code']) ? trim((string) $data['code']) : '';
        $code = $code === '' ? null : $code;

        if ($code !== null) {
            if (ctype_digit($code)) {
                $code = str_pad($code, 3, '0', STR_PAD_LEFT);
            } elseif (is_numeric($code)) {
                $code = str_pad((string) (int) $code, 3, '0', STR_PAD_LEFT);
            } else {
                return ['valid' => false, 'message' => 'Codice non valido (solo numeri).'];
            }
        }

        $category = trim((string) ($data['category_name'] ?? ''));
        $name = trim((string) ($data['name'] ?? ''));
        $unitRaw = trim((string) ($data['unit_default'] ?? ''));
        if ($unitRaw === '') {
            return ['valid' => false, 'message' => 'Unità di misura mancante.'];
        }
        $unit = Units::normalize($unitRaw);
        $priceRaw = trim((string) ($data['price_default'] ?? ''));
        $noteDefault = trim((string) ($data['note_default'] ?? ''));

        if ($category === '' || $name === '') {
            return ['valid' => false, 'message' => 'Campi obbligatori mancanti.'];
        }

        $priceRaw = str_replace(['€', ' '], '', $priceRaw);
        if ($priceRaw === '') {
            return ['valid' => false, 'message' => 'Prezzo non valido.'];
        }

        if (str_contains($priceRaw, ',')) {
            $priceRaw = str_replace('.', '', $priceRaw);
            $priceRaw = str_replace(',', '.', $priceRaw);
        } else {
            $priceRaw = str_replace(',', '.', $priceRaw);
        }

        if (! is_numeric($priceRaw)) {
            return ['valid' => false, 'message' => 'Prezzo non valido.'];
        }

        $price = (float) $priceRaw;

        return [
            'valid' => true,
            'code' => $code,
            'category_name' => $category,
            'name' => $name,
            'unit_default' => $unit,
            'price_default' => $price,
            'note_default' => $noteDefault === '' ? null : $noteDefault,
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

    private function generateCode(int $nextCode, array $seenCodes): string
    {
        $code = str_pad((string) $nextCode, 3, '0', STR_PAD_LEFT);
        while (isset($seenCodes[$code])) {
            $nextCode++;
            $code = str_pad((string) $nextCode, 3, '0', STR_PAD_LEFT);
        }

        return $code;
    }
}
