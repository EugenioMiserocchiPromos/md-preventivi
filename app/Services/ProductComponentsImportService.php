<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductComponentsImportService
{
    private const REQUIRED_FIELDS = ['product_code', 'component_name', 'unit_default', 'default_visible'];

    private const HEADER_ALIASES = [
        'product_code' => 'product_code',
        'product' => 'product_code',
        'prodotto' => 'product_code',
        'codice_prodotto' => 'product_code',
        'code' => 'product_code',
        'codice' => 'product_code',
        'component_name' => 'component_name',
        'component' => 'component_name',
        'componente' => 'component_name',
        'name' => 'component_name',
        'nome' => 'component_name',
        'unit_default' => 'unit_default',
        'unit' => 'unit_default',
        'unita' => 'unit_default',
        'qty_default' => 'qty_default',
        'qty' => 'qty_default',
        'quantity' => 'qty_default',
        'quantita' => 'qty_default',
        'price_default' => 'price_default',
        'price' => 'price_default',
        'prezzo' => 'price_default',
        'default_visible' => 'default_visible',
        'visible' => 'default_visible',
        'visibile' => 'default_visible',
        'sort_index' => 'sort_index',
        'sort' => 'sort_index',
        'ordine' => 'sort_index',
        'order' => 'sort_index',
    ];

    public function import(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (! $handle) {
            return $this->errorResult('Impossibile leggere il file.');
        }

        $headerRow = fgetcsv($handle, 0, ',');
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
            'skipped' => 0,
            'errors' => [],
        ];

        $rows = [];
        $rowIndex = 1;
        while (($row = fgetcsv($handle, 0, ',')) !== false) {
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

            $normalized['row'] = $rowIndex;
            $rows[] = $normalized;
        }

        fclose($handle);

        if (empty($rows)) {
            return $result;
        }

        $productCodes = collect($rows)->pluck('product_code')->unique()->values();
        $products = $this->loadProductsByCode($productCodes);

        $rowsByProduct = [];
        foreach ($rows as $row) {
            $product = $products->get($row['product_code']);
            if (! $product) {
                $result['skipped']++;
                $result['errors'][] = [
                    'row' => $row['row'],
                    'message' => "Prodotto non trovato per code {$row['product_code']}.",
                ];
                continue;
            }

            $rowsByProduct[$product->id][] = $row;
        }

        foreach ($rowsByProduct as $productId => $productRows) {
            DB::transaction(function () use ($productId, $productRows, &$result) {
                DB::table('product_components')->where('product_id', $productId)->delete();

                $insertRows = array_map(function ($row) use ($productId) {
                    return [
                        'product_id' => $productId,
                        'name' => $row['component_name'],
                        'unit_default' => $row['unit_default'],
                        'qty_default' => $row['qty_default'],
                        'price_default' => $row['price_default'],
                        'default_visible' => $row['default_visible'],
                        'sort_index' => $row['sort_index'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }, $productRows);

                if ($insertRows) {
                    DB::table('product_components')->insert($insertRows);
                    $result['created'] += count($insertRows);
                }
            });
        }

        return $result;
    }

    private function errorResult(string $message): array
    {
        return [
            'created' => 0,
            'skipped' => 0,
            'errors' => [['row' => 0, 'message' => $message]],
        ];
    }

    private function loadProductsByCode(Collection $codes): Collection
    {
        return DB::table('products')
            ->whereIn('code', $codes->all())
            ->get(['id', 'code'])
            ->keyBy('code');
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
        $header = Str::of($header)->lower()->trim();
        $header = str_replace(['-', ' '], '_', $header);
        return preg_replace('/_+/', '_', $header);
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
        $productCode = trim((string) ($data['product_code'] ?? ''));
        $productCode = $productCode === '' ? null : $productCode;

        if ($productCode === null) {
            return ['valid' => false, 'message' => 'product_code mancante.'];
        }

        if (! ctype_digit($productCode)) {
            return ['valid' => false, 'message' => 'product_code non valido (solo numeri).'];
        }

        $productCode = str_pad($productCode, 3, '0', STR_PAD_LEFT);

        $componentName = trim((string) ($data['component_name'] ?? ''));
        $unitDefault = trim((string) ($data['unit_default'] ?? ''));
        $qtyRaw = trim((string) ($data['qty_default'] ?? ''));
        $priceRaw = trim((string) ($data['price_default'] ?? ''));
        $defaultVisibleRaw = trim((string) ($data['default_visible'] ?? ''));
        $sortRaw = trim((string) ($data['sort_index'] ?? ''));

        if ($componentName === '' || $unitDefault === '') {
            return ['valid' => false, 'message' => 'component_name o unit_default mancanti.'];
        }

        $qty = null;
        if ($qtyRaw !== '') {
            if (! is_numeric(str_replace(',', '.', $qtyRaw))) {
                return ['valid' => false, 'message' => 'qty_default non valido.'];
            }
            $qty = (float) str_replace(',', '.', $qtyRaw);
        }

        $price = null;
        if ($priceRaw !== '') {
            if (! is_numeric(str_replace(',', '.', $priceRaw))) {
                return ['valid' => false, 'message' => 'price_default non valido.'];
            }
            $price = (float) str_replace(',', '.', $priceRaw);
        }

        $visible = $this->parseBool($defaultVisibleRaw);
        if ($visible === null) {
            return ['valid' => false, 'message' => 'default_visible non valido (true/false).'];
        }

        $sortIndex = 0;
        if ($sortRaw !== '') {
            if (! is_numeric($sortRaw)) {
                return ['valid' => false, 'message' => 'sort_index non valido.'];
            }
            $sortIndex = (int) $sortRaw;
        }

        return [
            'valid' => true,
            'product_code' => $productCode,
            'component_name' => $componentName,
            'unit_default' => $unitDefault,
            'qty_default' => $qty,
            'price_default' => $price,
            'default_visible' => $visible,
            'sort_index' => $sortIndex,
        ];
    }

    private function parseBool(string $value): ?bool
    {
        $value = strtolower($value);

        if (in_array($value, ['true', '1', 'si', 'yes', 'y'], true)) {
            return true;
        }

        if (in_array($value, ['false', '0', 'no', 'n'], true)) {
            return false;
        }

        return null;
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
