<?php

namespace App\Services;

use App\Support\Units;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductComponentsImportService
{
    private const REQUIRED_FIELDS = ['product_code', 'component_name', 'unit_default'];

    private const HEADER_ALIASES = [
        'product_code' => 'product_code',
        'product' => 'product_code',
        'prodotto' => 'product_code',
        'codice_prodotto' => 'product_code',
        'code' => 'product_code',
        'codice' => 'product_code',
        'cod' => 'product_code',
        'component_name' => 'component_name',
        'component' => 'component_name',
        'componente' => 'component_name',
        'name' => 'component_name',
        'descrizione' => 'component_name',
        'voce' => 'component_name',
        'nome' => 'component_name',
        'unit_default' => 'unit_default',
        'unit' => 'unit_default',
        'unita' => 'unit_default',
        'um' => 'unit_default',
        'unita_di_misura' => 'unit_default',
        'qty_default' => 'qty_default',
        'qty' => 'qty_default',
        'quantity' => 'qty_default',
        'quantita' => 'qty_default',
        'quantita_' => 'qty_default',
        'price_default' => 'price_default',
        'price' => 'price_default',
        'prezzo' => 'price_default',
        'prezzo_unitario' => 'price_default',
        'listino' => 'price_default',
        'default_visible' => 'default_visible',
        'visible' => 'default_visible',
        'visibile' => 'default_visible',
        'sort_index' => 'sort_index',
        'sort' => 'sort_index',
        'ordine' => 'sort_index',
        'pos' => 'sort_index',
        'order' => 'sort_index',
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
            'skipped' => 0,
            'errors' => [],
        ];

        $rows = [];
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
                $nextSortIndex = 1;
                foreach ($productRows as $row) {
                    $sortIndex = $row['sort_index'] ?? $nextSortIndex;
                    $nextSortIndex = max($nextSortIndex, $sortIndex + 1);

                    $payload = [
                        'product_id' => $productId,
                        'name' => $row['component_name'],
                        'unit_default' => $row['unit_default'],
                        'qty_default' => $row['qty_default'],
                        'price_default' => $row['price_default'],
                        'default_visible' => $row['default_visible'],
                        'sort_index' => $sortIndex,
                        'updated_at' => now(),
                    ];

                    $existing = DB::table('product_components')
                        ->where('product_id', $productId)
                        ->where('name', $row['component_name'])
                        ->first();

                    if ($existing) {
                        DB::table('product_components')
                            ->where('id', $existing->id)
                            ->update($payload);
                    } else {
                        $payload['created_at'] = now();
                        DB::table('product_components')->insert($payload);
                        $result['created']++;
                    }
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
        $productCode = trim((string) ($data['product_code'] ?? ''));
        $productCode = $productCode === '' ? null : $productCode;

        if ($productCode === null) {
            return ['valid' => false, 'message' => 'product_code mancante.'];
        }

        if (! ctype_digit($productCode)) {
            if (is_numeric($productCode)) {
                $productCode = (string) (int) $productCode;
            } else {
                return ['valid' => false, 'message' => 'product_code non valido (solo numeri).'];
            }
        }

        $productCode = str_pad($productCode, 3, '0', STR_PAD_LEFT);

        $componentName = trim((string) ($data['component_name'] ?? ''));
        $unitRaw = trim((string) ($data['unit_default'] ?? ''));
        if ($unitRaw === '') {
            return ['valid' => false, 'message' => 'component_name o unit_default mancanti.'];
        }
        $unitDefault = Units::normalize($unitRaw);
        $qtyRaw = trim((string) ($data['qty_default'] ?? ''));
        $priceRaw = trim((string) ($data['price_default'] ?? ''));
        $defaultVisibleRaw = trim((string) ($data['default_visible'] ?? ''));
        $sortRaw = trim((string) ($data['sort_index'] ?? ''));

        if ($componentName === '') {
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
            $priceRaw = str_replace(['€', ' ', "\t"], '', $priceRaw);
            if (str_contains($priceRaw, ',')) {
                $priceRaw = str_replace('.', '', $priceRaw);
                $priceRaw = str_replace(',', '.', $priceRaw);
            } else {
                $priceRaw = str_replace(',', '.', $priceRaw);
            }

            if (! is_numeric($priceRaw)) {
                return ['valid' => false, 'message' => 'price_default non valido.'];
            }
            $price = (float) $priceRaw;
        }

        $visible = $defaultVisibleRaw === '' ? true : $this->parseBool($defaultVisibleRaw);
        if ($visible === null) {
            return ['valid' => false, 'message' => 'default_visible non valido (true/false).'];
        }

        $sortIndex = null;
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

        if ($value === '') {
            return null;
        }

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
