<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Preventivo {{ $quote->prot_display }}</title>
    <style>
      @font-face {
        font-family: 'Jost';
        font-style: normal;
        font-weight: 600;
        src: url("{{ 'file://' . public_path('fonts/Jost/Jost-SemiBold.ttf') }}") format('truetype');
      }
      @font-face {
        font-family: 'Jost';
        font-style: normal;
        font-weight: 700;
        src: url("{{ 'file://' . public_path('fonts/Jost/Jost-Bold.ttf') }}") format('truetype');
      }
      @font-face {
        font-family: 'Jost';
        font-style: normal;
        font-weight: 500;
        src: url("{{ 'file://' . public_path('fonts/Jost/Jost-Medium.ttf') }}") format('truetype');
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
      @page rows {
        margin: 360px 40px 120px 40px;
        @bottom-center {
          content: element(pdf-footer);
          width: 100%;
        }
        @top-center {
          content: element(pdf-header);
          width: 100%;
        }
      }
      @page rows:first {
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
        padding-bottom: 0;
      }
      .page.rows {
        page: rows;
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
        word-wrap: break-word;
        box-sizing: border-box;
        border: 1px solid #e2e8f0;
      }
      .items tbody td .cell-pad {
        font-size: 9.5px;
        line-height: 11px;
      }
      .items tbody td.note-cell .cell-pad {
        font-size: 8px;
        line-height: 10.5px;
      }
      .cell-pad {
        padding: 2px;
        display: block;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
      }
      .product-category-row {
        background: rgba(149, 129, 123, 0.15);
        font-weight: 600;
      }
      .product-category-row td,
      .product-category-row th {
        font-family: 'Open Sans', sans-serif;
        color: #000000;
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left:5px;
        text-align: left !important;
        border: none;
        font-weight:700;
        font-size: 11px;
        line-height: 13px;
      }
      .extra-row {
        background: rgba(149, 129, 123, 0.15);
        font-size: 11px;
        line-height: 13px;
        font-weight: 500;
      }
      .extra-row .cell-pad {
        font-size: 11px;
        line-height: 13px;
        font-weight: 500;
      }
      .total-row {
        background: #95817b;
        font-size: 11px;
        line-height: 13px;
        font-weight: 700;
      }
      .total-row td,
      .total-row .cell-pad {
        color: #ffffff;
        font-size: 11px;
        line-height: 13px;
        font-weight: 700;
      }
      .extra-spacer td {
        height: 5px;
        padding: 0;
        border: none;
        background: #ffffff;
      }
      .table-spacer td {
        height: 100px;
        padding: 0;
      }
      .category-header-row th {
        padding-top: 6px;
        padding-bottom: 6px;
      }
      .category-header {
        text-align: center;
        padding-top: 6px;
        padding-bottom: 6px;
        font-family: 'Jost', 'Open Sans', sans-serif;
        font-weight: 700;
        font-size: 21px;
        line-height:23px;
        color: #95817b;
      }
      .component-row {
        color: #475569;
        font-size: 11px;
      }
      .component-row td {
        border-top: none;
        border-bottom: none;
      }
      .row-end td {
        border-bottom: 1px solid #e2e8f0 !important;
      }
      .row-end td[rowspan] {
        border-bottom: 1px solid #e2e8f0 !important;
      }
      .item-no-divider td:not([rowspan]) {
        border-bottom: none;
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
      .pdf-header {
        position: running(pdf-header);
        width: 100%;
        margin-top:50px;
      }
      .header-legend th {
        font-family: 'Jost', 'Open Sans', sans-serif;
        font-size: 9.5px;
        line-height: 12px;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.08em;
        color: #64748b;
        text-align: center;
        padding: 4px 4px;
        border: 1px solid #e2e8f0;
      }
      .header-legend .cell-pad {
        padding: 0;
      }
      .header-left,
      .header-right {
        vertical-align: top;
      }
      .header-left {
        font-family: 'Open Sans', sans-serif;
        font-size:10px;
        line-height:12px;
        width: 50%;
        color: #475569;
        font-weight: 400;
        text-align: left;
        min-height:245px;
        height:245px;
      }
      .header-right {
        width: 50%;
        text-align: left;
        font-size: 11px;
        max-height:245px;
      }
      .header-info {
        width: 100%;
        border-collapse: collapse;
      }
      .header-info td {
        padding: 6px 0;
        vertical-align: top;
      }
      .header-info .info-label {
        font-family: 'Jost', sans-serif;
        width: 40%;
        font-size: 12px;
        line-height:14px;
        letter-spacing: 0.08em;
        color: #95817b;
        text-align: left;
        font-weight:700;
      }
      .header-info .info-underline {
        margin-top: 5px;
        border-bottom: 1px solid #95817b;
      }
      .header-info .info-value {
        width: 60%;
        font-size: 10px;
        line-height:12px;
        color: #000000;
        text-align: left;
        white-space: pre-wrap;
        padding-left: 10px;
      }
      .pdf-footer {
        position: running(pdf-footer);
        height: 70px;
        margin: 0;
        padding: 0;
        width: 100%;
        display: block;
      }
      .footer-signatures {
        width: 100%;
        margin: 0;
        padding: 0;
        display: table;
        table-layout: fixed;
      }
      .signature-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin: 0;
        padding: 0;
      }
      .signature-table td {
        padding: 0;
      }
      .signature-spacer {
        width: 4%;
      }
      .signature-col {
        width: 48%;
      }
      .signature-box {
        border-bottom: 1px solid #95817b;
        height: 44px;
        width: 100%;
        box-sizing: border-box;
      }
      .signature-label {
        font-family: 'Jost', sans-serif;
        font-weight: 500;
        text-align:center;
        font-size: 10px;
        line-height:12px;
        color: #000000;
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
          'FP' => 'Fornitura e Posa in opera',
          'AS' => 'Assistenza',
          'VM' => 'Vendita Materiale',
          default => $quote->quote_type,
      };
    @endphp

    <section class="page rows">
      <div class="pdf-header">
        <table class="header-block">
          <tr>
            <td class="header-left">
              <div style="margin-bottom:6px;">
                <img src="{{ public_path('pdf/logo-md.png') }}" alt="MD Italia" style="width:65%; display:block;" />
              </div>
              <div style="margin-bottom:6px;">
                <strong style="font-size:11px;line-height:13px;">MD ITALIA SRL con Unico Socio</strong><br />
                Via Ravenna, 151/EFG<br />
                47814 - Bellaria Igea Marina (Rn) <br />
                P.I./C.F. 04172350409 - Cod. SDI: M5UXCR1<br />
                Tel. 0541 341240<br />
                e-mail: direzione.tecnica@mditaliasrl.it<br />
                <br />
                <strong style="font-size:11px;line-height:13px;">Distributore Esclusivo per:<br />Romagna - Marche - Ferrara - Bologna</strong>
              </div>
              <div style="margin-top:4px;">
                <img src="{{ public_path('pdf/logo-penetron.svg') }}" alt="Penetron" style="width:55%; display:block;" />
              </div>
            </td>
            <td class="header-right">
              <table class="header-info">
                <tr>
                  <td class="info-label">Prot. numero<div class="info-underline"></div></td>
                  <td class="info-value">{{ $quote->prot_internal ?? $quote->prot_display }}</td>
                </tr>
                <tr>
                  <td class="info-label">Data<div class="info-underline"></div></td>
                  <td class="info-value">{{ $quote->date }}</td>
                </tr>
                <tr>
                  <td class="info-label">Intervento<div class="info-underline"></div></td>
                  <td class="info-value">{{ $quote->title_text }}</td>
                </tr>
                <tr>
                  <td class="info-label">Cliente<div class="info-underline"></div></td>
                  <td class="info-value">{{ $quote->customer_title_snapshot }}@if(!empty($quote->customer_body_snapshot))&#10;{{ $quote->customer_body_snapshot }}@endif</td>
                </tr>
                <tr>
                  <td class="info-label">Cantiere<div class="info-underline"></div></td>
                  <td class="info-value">{{ $quote->cantiere }}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <div class="category-header-row">
          <div class="cell-pad category-header">{{ $quoteTypeLabel }}</div>
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
            <tr class="header-legend">
              <th class="code-cell"><div class="cell-pad">Cod.</div></th>
              <th><div class="cell-pad">Prodotto</div></th>
              <th class="um-cell"><div class="cell-pad">U.M.</div></th>
              <th><div class="cell-pad">Quantità</div></th>
              <th class="symbol-cell"><div class="cell-pad"></div></th>
              <th><div class="cell-pad">Prezzo</div></th>
              <th class="symbol-cell"><div class="cell-pad"></div></th>
              <th><div class="cell-pad">Tot. Parziale</div></th>
              <th class="note-cell"><div class="cell-pad">Note</div></th>
            </tr>
          </thead>
        </table>
      </div>

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

    @foreach ($grouped as $category => $items)
      <table class="items category-table">
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
          <tr class="product-category-row">
            <th colspan="9">{{ $category }}</th>
          </tr>
        </thead>
        @foreach ($items as $item)
          @php
            $visibleComponents = $item->components->where('is_visible', true);
            $componentCount = $visibleComponents->count();
            $rowspan = $componentCount + 1;
          @endphp
          <tbody class="avoid-break">
            <tr class="avoid-break {{ $componentCount > 0 ? 'item-no-divider' : 'row-end' }}">
                @if ($componentCount > 0)
                  <td class="code-cell" style="width:8%;" rowspan="{{ $rowspan }}"><div class="cell-pad">{{ $item->product_code_snapshot }}</div></td>
                @else
                  <td class="code-cell" style="width:8%;"><div class="cell-pad">{{ $item->product_code_snapshot }}</div></td>
                @endif
                <td style="width:28%;"><div class="cell-pad">{{ $item->name_snapshot }}</div></td>
                <td class="um-cell" style="width:6%;"><div class="cell-pad">{{ $item->unit_override }}</div></td>
                <td class="text-right" style="width:10%;"><div class="cell-pad">{{ number_format((float) $item->qty, 2, ',', '.') }}</div></td>
                <td class="symbol-cell" style="width:3%;"><div class="cell-pad">x</div></td>
                <td class="text-right" style="width:10%;"><div class="cell-pad">€ {{ number_format((float) $item->unit_price_override, 2, ',', '.') }}</div></td>
                <td class="symbol-cell" style="width:3%;"><div class="cell-pad">=</div></td>
                <td class="text-right" style="width:12%;"><div class="cell-pad">€ {{ number_format((float) $item->line_total, 2, ',', '.') }}</div></td>
                @if ($componentCount > 0)
                  <td class="note-cell" style="width:20%;" rowspan="{{ $rowspan }}"><div class="cell-pad">{{ $item->note_shared }}</div></td>
                @else
                  <td class="note-cell" style="width:20%;"><div class="cell-pad">{{ $item->note_shared }}</div></td>
                @endif
            </tr>
            @foreach ($visibleComponents as $componentIndex => $component)
              <tr class="component-row avoid-break {{ $loop->last ? 'row-end' : '' }}">
                  <td style="width:28%;"><div class="cell-pad">— {{ $component->name_snapshot }}</div></td>
                  <td class="um-cell" style="width:6%;"><div class="cell-pad">{{ $component->unit_override }}</div></td>
                  <td class="text-right" style="width:10%;"><div class="cell-pad">{{ number_format((float) $component->qty, 2, ',', '.') }}</div></td>
                  <td class="symbol-cell" style="width:3%;"><div class="cell-pad">x</div></td>
                  <td class="text-right" style="width:10%;"><div class="cell-pad">€ {{ number_format((float) $component->unit_price_override, 2, ',', '.') }}</div></td>
                  <td class="symbol-cell" style="width:3%;"><div class="cell-pad">=</div></td>
                  <td class="text-right" style="width:12%;"><div class="cell-pad">€ {{ number_format((float) $component->component_total, 2, ',', '.') }}</div></td>
              </tr>
            @endforeach
          </tbody>
        @endforeach
      </table>
    @endforeach

    @if ($extras->count() > 0)
      @php
        $extrasOrder = [
          'Assistenza tecnica in cantiere e Progettazione vasca',
          'Oneri derivanti da trasferte personale applicatore e tecnico',
        ];
        $extrasByDesc = $extras->keyBy(function ($extra) {
          return trim((string) $extra->description);
        });
        $extrasRendered = collect();
        foreach (array_slice($extrasOrder, 0, 2) as $label) {
          if ($extrasByDesc->has($label)) {
            $extrasRendered->push($extrasByDesc->get($label));
          }
        }
        $extrasRemaining = $extras->reject(function ($extra) use ($extrasOrder) {
          if ($extra->fixed_key === 'warranty_10y') {
            return true;
          }
          return in_array(trim((string) $extra->description), $extrasOrder, true);
        });
        $extrasTail = collect();
        $warrantyExtra = $extras->first(function ($extra) {
          return $extra->fixed_key === 'warranty_10y';
        });
        if ($warrantyExtra) {
          $extrasTail->push($warrantyExtra);
        }
      @endphp
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
        <tbody>
          <tr class="table-spacer">
            <td style="width:8%;"></td>
            <td style="width:28%;"></td>
            <td style="width:6%;"></td>
            <td style="width:10%;"></td>
            <td style="width:3%;"></td>
            <td style="width:10%;"></td>
            <td style="width:3%;"></td>
            <td style="width:12%;"></td>
            <td style="width:20%;"></td>
          </tr>
          @foreach ($extrasRendered as $extra)
            <tr class="extra-spacer">
              <td colspan="9"></td>
            </tr>
            <tr class="avoid-break extra-row">
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
          @foreach ($extrasRemaining as $extra)
            <tr class="extra-spacer">
              <td colspan="9"></td>
            </tr>
            <tr class="avoid-break extra-row">
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
          <tr class="extra-spacer">
            <td colspan="9"></td>
          </tr>
          <tr class="avoid-break total-row">
            <td colspan="7" style="width:70%; text-align:left;"><div class="cell-pad">Totale</div></td>
            <td class="text-right" style="width:12%;"><div class="cell-pad">€ {{ number_format((float) ($quote->grand_total ?? 0), 2, ',', '.') }}</div></td>
            <td class="note-cell" style="width:20%; text-align: left;"><div class="cell-pad">+ IVA</div></td>
          </tr>
          @foreach ($extrasTail as $extra)
            <tr class="extra-spacer">
              <td colspan="9"></td>
            </tr>
            @if ($extra->fixed_key === 'warranty_10y')
              <tr class="avoid-break extra-row">
                <td colspan="7" style="width:70%; text-align:left;">
                  <div class="cell-pad">Costo una-tantum per Garanzia Decennale Postuma di Rimpiazzo e Posa in Opera (a 30 gg dal saldo dell'ultima fattura)</div>
                </td>
                <td class="text-right" style="width:12%;">
                  <div class="cell-pad">
                    @if ((float) $extra->unit_price > 0)
                      € {{ number_format((float) $extra->unit_price, 2, ',', '.') }}
                    @else
                      Non compresa
                    @endif
                  </div>
                </td>
                <td class="note-cell" style="width:20%;"><div class="cell-pad"></div></td>
              </tr>
            @else
              <tr class="avoid-break extra-row">
                <td colspan="2" style="width:36%;"><div class="cell-pad">{{ $extra->description }}</div></td>
                <td class="um-cell" style="width:6%;"><div class="cell-pad">{{ $extra->unit }}</div></td>
                <td class="text-right" style="width:10%;"><div class="cell-pad">{{ number_format((float) $extra->qty, 2, ',', '.') }}</div></td>
                <td class="symbol-cell" style="width:3%;"><div class="cell-pad">x</div></td>
                <td class="text-right" style="width:10%;"><div class="cell-pad">€ {{ number_format((float) $extra->unit_price, 2, ',', '.') }}</div></td>
                <td class="symbol-cell" style="width:3%;"><div class="cell-pad">=</div></td>
                <td class="text-right" style="width:12%;"><div class="cell-pad">€ {{ number_format((float) $extra->line_total, 2, ',', '.') }}</div></td>
                <td class="note-cell" style="width:20%;"><div class="cell-pad">{{ $extra->notes }}</div></td>
              </tr>
            @endif
          @endforeach
          <tr class="extra-spacer">
            <td colspan="9"></td>
          </tr>
          <tr class="avoid-break extra-row">
            <td colspan="9" style="text-align:left;"><div class="cell-pad">Pagamenti: da Concordare</div></td>
          </tr>
        </tbody>
      </table>
    @endif
    </section>
  </body>
</html>
