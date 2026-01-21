<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Preventivo {{ $quote->prot_display }}</title>
    <style>
      @page {
        margin: 36px 40px 40px 40px;
      }
      body {
        font-family: DejaVu Sans, sans-serif;
        font-size: 12px;
        color: #0f172a;
      }
      h1 {
        font-size: 24px;
        margin: 0 0 12px 0;
        line-height: 1.2;
      }
      .subtitle {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #475569;
        margin-bottom: 8px;
      }
      .field {
        margin-top: 16px;
      }
      .label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        margin-bottom: 4px;
      }
      .value {
        font-size: 14px;
        line-height: 1.35;
        word-wrap: break-word;
        white-space: pre-wrap;
      }
      .prot {
        font-size: 16px;
        font-weight: 600;
      }
      .page-break {
        page-break-after: always;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      thead {
        display: table-header-group;
      }
      tfoot {
        display: table-footer-group;
      }
      .items th {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        text-align: left;
        padding: 6px 4px;
        border-bottom: 1px solid #e2e8f0;
      }
      .items td {
        padding: 6px 4px;
        vertical-align: top;
      }
      .category-row {
        background: #f8fafc;
        font-weight: 600;
      }
      .component-row {
        color: #475569;
        font-size: 11px;
      }
      .note-row {
        font-size: 11px;
        color: #475569;
      }
      .text-right {
        text-align: right;
      }
      .nowrap {
        white-space: nowrap;
      }
      .avoid-break {
        page-break-inside: avoid;
      }
      .header-block {
        width: 100%;
        margin-bottom: 10px;
      }
      .header-left,
      .header-right {
        vertical-align: top;
      }
      .header-left {
        width: 50%;
        font-size: 11px;
        color: #475569;
      }
      .header-right {
        width: 50%;
        text-align: right;
        font-size: 11px;
      }
      .footer-signatures {
        width: 100%;
        margin-top: 24px;
      }
      .signature-box {
        border: 1px solid #cbd5f5;
        height: 60px;
      }
      .signature-label {
        font-size: 10px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 6px;
      }
    </style>
  </head>
  <body>
    <div>
      <div class="subtitle">Preventivo</div>
      <h1>{{ $quote->title_text }}</h1>

      <div class="field">
        <div class="label">PROT</div>
        <div class="value prot">{{ $quote->prot_display }}</div>
      </div>

      <div class="field">
        <div class="label">Cliente</div>
        <div class="value">{{ $quote->customer_title_snapshot }}</div>
      </div>

      <div class="field">
        <div class="label">Data</div>
        <div class="value">{{ $quote->date }}</div>
      </div>

      <div class="field">
        <div class="label">Cantiere</div>
        <div class="value">{{ $quote->cantiere }}</div>
      </div>
    </div>

    @if ($quote->items->count() > 0)
      <div class="page-break"></div>
    @endif

    @php
      $sortedItems = $quote->items
        ->sortBy(function ($item) {
          return sprintf('%s-%05d-%010d', $item->category_name_snapshot, $item->sort_index, $item->id);
        })
        ->values();
      $grouped = $sortedItems->groupBy(function ($item) {
        return $item->category_name_snapshot ?: 'Senza categoria';
      });
    @endphp

    @if ($sortedItems->count() > 0)
      <table class="items">
        <thead>
          <tr>
            <td colspan="6">
              <table class="header-block">
                <tr>
                  <td class="header-left">
                    <strong>MD ITALIA</strong><br />
                    Via esempio 123<br />
                    16100 Genova (GE)<br />
                    P.IVA 00000000000
                  </td>
                  <td class="header-right">
                    <div><strong>PROT:</strong> {{ $quote->prot_display }}</div>
                    <div><strong>Data:</strong> {{ $quote->date }}</div>
                    <div><strong>Cliente:</strong> {{ $quote->customer_title_snapshot }}</div>
                    <div><strong>Cantiere:</strong> {{ $quote->cantiere }}</div>
                    <div><strong>Titolo:</strong> {{ $quote->title_text }}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <th>Codice</th>
            <th>Voce</th>
            <th class="text-right nowrap">UM</th>
            <th class="text-right nowrap">Qtà</th>
            <th class="text-right nowrap">Prezzo</th>
            <th class="text-right nowrap">Totale</th>
          </tr>
        </thead>
        <tbody>
          @foreach ($grouped as $category => $items)
            <tr class="category-row">
              <td colspan="6">{{ $category }}</td>
            </tr>
            @foreach ($items as $item)
              <tr class="avoid-break">
                <td class="nowrap">{{ $item->product_code_snapshot }}</td>
                <td>{{ $item->name_snapshot }}</td>
                <td class="text-right nowrap">{{ $item->unit_override }}</td>
                <td class="text-right nowrap">{{ number_format((float) $item->qty, 2, ',', '.') }}</td>
                <td class="text-right nowrap">€ {{ number_format((float) $item->unit_price_override, 2, ',', '.') }}</td>
                <td class="text-right nowrap">€ {{ number_format((float) $item->line_total, 2, ',', '.') }}</td>
              </tr>
              @if (!empty($item->note_shared))
                <tr class="note-row avoid-break">
                  <td></td>
                  <td colspan="5"><strong>Note:</strong> {{ $item->note_shared }}</td>
                </tr>
              @endif
              @foreach ($item->components->where('is_visible', true) as $component)
                <tr class="component-row avoid-break">
                  <td></td>
                  <td>— {{ $component->name_snapshot }}</td>
                  <td class="text-right nowrap">{{ $component->unit_override }}</td>
                  <td class="text-right nowrap">{{ number_format((float) $component->qty, 2, ',', '.') }}</td>
                  <td class="text-right nowrap">€ {{ number_format((float) $component->unit_price_override, 2, ',', '.') }}</td>
                  <td class="text-right nowrap">€ {{ number_format((float) $component->component_total, 2, ',', '.') }}</td>
                </tr>
              @endforeach
            @endforeach
          @endforeach
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6">
              <table class="footer-signatures">
                <tr>
                  <td>
                    <div class="signature-label">Firma</div>
                    <div class="signature-box"></div>
                  </td>
                  <td style="width: 20px;"></td>
                  <td>
                    <div class="signature-label">Timbro</div>
                    <div class="signature-box"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </tfoot>
      </table>
    @endif
  </body>
</html>
