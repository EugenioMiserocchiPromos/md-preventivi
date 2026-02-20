<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Preventivo {{ $quote->prot_display }}</title>
    <style>
      @font-face {
        font-family: 'Days One';
        font-style: normal;
        font-weight: 400;
        src: url("{{ 'file://' . public_path('fonts/DaysOne/DaysOne-Regular.ttf') }}") format('truetype');
      }
      @font-face {
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 300;
        src: url("{{ 'file://' . public_path('fonts/OpenSans/OpenSans-Light.ttf') }}") format('truetype');
      }
      @font-face {
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 400;
        src: url("{{ 'file://' . public_path('fonts/OpenSans/OpenSans-Regular.ttf') }}") format('truetype');
      }
      @font-face {
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 500;
        src: url("{{ 'file://' . public_path('fonts/OpenSans/OpenSans-Medium.ttf') }}") format('truetype');
      }
      @font-face {
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 700;
        src: url("{{ 'file://' . public_path('fonts/OpenSans/OpenSans-Bold.ttf') }}") format('truetype');
      }
      @font-face {
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 800;
        src: url("{{ 'file://' . public_path('fonts/OpenSans/OpenSans-ExtraBold.ttf') }}") format('truetype');
      }
      @page {
        margin: 40px 40px 40px 40px;
        @bottom-center {
          content: element(pdf-footer);
        }
      }
      @page :first {
        @bottom-center {
          content: none;
        }
      }
      html,
      body {
        height: 100%;
      }
      body {
        font-family: 'Open Sans', sans-serif;
        font-size: 12px;
        color: #0f172a;
        margin: 0;
        padding-bottom: 90px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      thead {
        display: table-header-group;
      }
      .items {
        table-layout: fixed;
        width: 100%;
        border-collapse: collapse;
      }
      .items th {
        font-size: 10px;
        text-transform: none;
        letter-spacing: 0.08em;
        color: #64748b;
        text-align: center;
        padding: 6px 4px;
        border-bottom: 1px solid #e2e8f0;
      }
      .items thead .col-widths th {
        padding: 0;
        border: none;
        height: 0;
        line-height: 0;
        font-size: 0;
      }
      .items td,
      .items th {
        padding: 2px;
        vertical-align: middle;
        font-size: 10px;
        word-wrap: break-word;
        box-sizing: border-box;
        border: 1px solid #e2e8f0;
      }
      .cell-pad {
        padding: 2px;
        display: block;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
      }
      .category-row {
        background: #f8fafc;
        font-weight: 600;
      }
      .category-row td {
        font-family: 'Open Sans', sans-serif;
      }
      .category-header-row th {
        padding-top: 6px;
        padding-bottom: 6px;
      }
      .category-header {
        text-align: center;
        padding-top: 6px;
        padding-bottom: 6px;
      }
      .component-row {
        color: #475569;
        font-size: 11px;
      }
      .text-right {
        text-align: right !important;
      }
      .text-center {
        text-align: center !important;
      }
      .code-cell {
        text-align: center !important;
        vertical-align: middle !important;
      }
      .symbol-cell {
        text-align: center !important;
        vertical-align: middle !important;
      }
      .um-cell {
        text-align: center !important;
        vertical-align: middle !important;
      }
      .note-cell {
        text-align: center !important;
        vertical-align: middle !important;
        white-space: normal;
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
        font-size: 8px!important;
        line-height:10px;
        color: #475569;
        font-weight: 400;
      }
      .header-right {
        width: 50%;
        text-align: right;
        font-size: 11px;
      }
      .pdf-footer {
        position: running(pdf-footer);
      }
      .footer-signatures {
        width: 100%;
      }
      .signature-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .signature-spacer {
        width: 4%;
      }
      .signature-col {
        width: 48%;
      }
      .signature-box {
        border: 1px solid #cbd5f5;
        height: 44px;
      }
      .signature-label {
        font-size: 10px;
        text-transform: uppercase;
        color: #64748b;
        margin-bottom: 6px;
      }
    </style>
  </head>
  <body>
    @php
      $sortedItems = $quote->items
        ->sortBy(function ($item) {
          return sprintf('%s-%05d-%010d', $item->category_name_snapshot, $item->sort_index, $item->id);
        })
        ->values();
      $grouped = $sortedItems->groupBy(function ($item) {
        return $item->category_name_snapshot ?: 'Senza categoria';
      });
      $extras = $quote->extras ?? collect();
    @endphp

    @php
      $quoteTypeLabel = match ($quote->quote_type) {
          'FP' => 'Fornitura e Posa',
          'AS' => 'Assistenza',
          'VM' => 'Vendita Materiale',
          default => $quote->quote_type,
      };
    @endphp

    <section class="page rows">
      <div class="pdf-footer">
        <table class="footer-signatures signature-table">
          <tr>
            <td class="signature-col">
              <div class="signature-label">MD Italia Srl</div>
              <div class="signature-box"></div>
            </td>
            <td class="signature-spacer"></td>
            <td class="signature-col">
              <div class="signature-label">Firma dell’acquirente per accettazione</div>
              <div class="signature-box"></div>
            </td>
          </tr>
        </table>
      </div>

      <table class="items">
      <colgroup>
        <col style="width:8%;" />
        <col style="width:28%;" />
        <col style="width:6%;" />
        <col style="width:10%;" />
        <col style="width:3%;" />
        <col style="width:10%;" />
        <col style="width:3%;" />
        <col style="width:12%;" />
        <col style="width:20%;" />
      </colgroup>
      <thead>
        <tr class="col-widths">
          <th style="width:8%;"></th>
          <th style="width:28%;"></th>
          <th style="width:6%;"></th>
          <th style="width:10%;"></th>
          <th style="width:3%;"></th>
          <th style="width:10%;"></th>
          <th style="width:3%;"></th>
          <th style="width:12%;"></th>
          <th style="width:20%;"></th>
        </tr>
        <tr>
          <th colspan="9" style="padding:0; border:none;">
            <table class="header-block">
              <tr>
                <td class="header-left">
                  <div style="margin-bottom:6px;">
                    <img src="{{ public_path('pdf/logo-md.png') }}" alt="MD Italia" style="width:65%; display:block;" />
                  </div>
                  <div style="margin-bottom:6px;">
                    <strong>MD ITALIA SRL con Unico Socio</strong><br />
                    Via Ravenna, 151/EFG - 47814 - Bellaria Igea Marina (Rn) <br />
                    P.I./C.F. 04172350409 - Cod. SDI: M5UXCR1<br />
                    Resp.: Geom. Dellamotta Marco - Cell. 320 2122135<br />
                    Tel. 0541 341240-fax 0541/1788614<br />
                    e-mail: direzione.tecnica@mditaliasrl.it<br />
                    <br />
                    <strong>Distributore Esclusivo per: Romagna-Marche-Ferrara</strong>
                  </div>
                  <div style="margin-top:4px;">
                    <img src="{{ public_path('pdf/logo-penetron.svg') }}" alt="Penetron" style="width:65%; display:block;" />
                  </div>
                </td>
                <td class="header-right">
                  <div><strong>PROT:</strong> {{ $quote->prot_internal ?? $quote->prot_display }}</div>
                  <div><strong>Data:</strong> {{ $quote->date }}</div>
                  <div><strong>Cliente:</strong> {{ $quote->customer_title_snapshot }}</div>
                  <div><strong>Cantiere:</strong> {{ $quote->cantiere }}</div>
                  <div><strong>Titolo:</strong> {{ $quote->title_text }}</div>
                </td>
              </tr>
            </table>
          </th>
        </tr>
        <tr class="category-row category-header-row">
          <th colspan="9">
            <div class="cell-pad category-header">{{ $quoteTypeLabel }}</div>
          </th>
        </tr>
        <tr>
          <th class="code-cell" style="width:8%;"><div class="cell-pad">Codice</div></th>
          <th style="width:28%;"><div class="cell-pad">Voce</div></th>
          <th class="um-cell" style="width:6%;"><div class="cell-pad">UM</div></th>
          <th style="width:10%;"><div class="cell-pad">Qtà</div></th>
          <th class="symbol-cell" style="width:3%;"><div class="cell-pad"></div></th>
          <th style="width:10%;"><div class="cell-pad">Prezzo</div></th>
          <th class="symbol-cell" style="width:3%;"><div class="cell-pad"></div></th>
          <th style="width:12%;"><div class="cell-pad">Totale</div></th>
          <th class="note-cell" style="width:20%;"><div class="cell-pad">Note</div></th>
        </tr>
      </thead>
      <tbody>
        @foreach ($grouped as $category => $items)
          <tr class="category-row">
            <td colspan="9">{{ $category }}</td>
          </tr>
          @foreach ($items as $item)
            <tr class="avoid-break">
              <td class="code-cell" style="width:8%;"><div class="cell-pad">{{ $item->product_code_snapshot }}</div></td>
              <td style="width:28%;"><div class="cell-pad">{{ $item->name_snapshot }}</div></td>
              <td class="um-cell" style="width:6%;"><div class="cell-pad">{{ $item->unit_override }}</div></td>
              <td class="text-right" style="width:10%;"><div class="cell-pad">{{ number_format((float) $item->qty, 2, ',', '.') }}</div></td>
              <td class="symbol-cell" style="width:3%;"><div class="cell-pad">x</div></td>
              <td class="text-right" style="width:10%;"><div class="cell-pad">€ {{ number_format((float) $item->unit_price_override, 2, ',', '.') }}</div></td>
              <td class="symbol-cell" style="width:3%;"><div class="cell-pad">=</div></td>
              <td class="text-right" style="width:12%;"><div class="cell-pad">€ {{ number_format((float) $item->line_total, 2, ',', '.') }}</div></td>
              <td class="note-cell" style="width:20%;"><div class="cell-pad">{{ $item->note_shared }}</div></td>
            </tr>
            @foreach ($item->components->where('is_visible', true) as $component)
              <tr class="component-row avoid-break">
                <td class="code-cell" style="width:8%;"><div class="cell-pad"></div></td>
                <td style="width:28%;"><div class="cell-pad">— {{ $component->name_snapshot }}</div></td>
                <td class="um-cell" style="width:6%;"><div class="cell-pad">{{ $component->unit_override }}</div></td>
                <td class="text-right" style="width:10%;"><div class="cell-pad">{{ number_format((float) $component->qty, 2, ',', '.') }}</div></td>
                <td class="symbol-cell" style="width:3%;"><div class="cell-pad">x</div></td>
                <td class="text-right" style="width:10%;"><div class="cell-pad">€ {{ number_format((float) $component->unit_price_override, 2, ',', '.') }}</div></td>
                <td class="symbol-cell" style="width:3%;"><div class="cell-pad">=</div></td>
                <td class="text-right" style="width:12%;"><div class="cell-pad">€ {{ number_format((float) $component->component_total, 2, ',', '.') }}</div></td>
                <td style="width:20%;"><div class="cell-pad"></div></td>
              </tr>
            @endforeach
          @endforeach
        @endforeach

        @if ($extras->count() > 0)
          <tr>
            <td colspan="9">&nbsp;</td>
          </tr>
          <tr>
            <td colspan="9">&nbsp;</td>
          </tr>
          @foreach ($extras as $extra)
            <tr class="avoid-break">
              <td colspan="2" style="width:36%;"><div class="cell-pad">{{ $extra->description }}</div></td>
              <td class="um-cell" style="width:6%;"><div class="cell-pad">{{ $extra->unit }}</div></td>
              <td class="text-right" style="width:10%;"><div class="cell-pad">{{ number_format((float) $extra->qty, 2, ',', '.') }}</div></td>
              <td class="symbol-cell" style="width:3%;"><div class="cell-pad">x</div></td>
              <td class="text-right" style="width:10%;"><div class="cell-pad">€ {{ number_format((float) $extra->unit_price, 2, ',', '.') }}</div></td>
              <td class="symbol-cell" style="width:3%;"><div class="cell-pad">=</div></td>
              <td class="text-right" style="width:12%;"><div class="cell-pad">€ {{ number_format((float) $extra->line_total, 2, ',', '.') }}</div></td>
              <td class="note-cell" style="width:20%;"><div class="cell-pad">{{ $extra->notes }}</div></td>
            </tr>
          @endforeach
        @endif
      </tbody>
      </table>
    </section>
  </body>
</html>
