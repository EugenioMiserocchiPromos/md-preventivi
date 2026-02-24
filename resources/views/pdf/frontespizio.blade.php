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
      @page {
        margin: 36px 40px 24px 40px;
      }
      @page :first {
        margin: 0;
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
      }
      h1 {
        font-family: 'Jost', 'Open Sans', sans-serif;
        font-size: 22.5px;
        margin: 0 0 50px 0;
        line-height: 24px;
        color: #95817b;
        font-weight: 600;
      }
      .frontespizio-subtitle {
        line-height: 24px;
        font-family: 'Jost', 'Open Sans', sans-serif;
        font-size: 22.5px;
        letter-spacing: 1px;
        color: #cd1719;
        margin: 0 0 6px 0;
        font-weight: 600;
      }
      .frontespizio-wrap {
        width: 100%;
        height: 100%;
        border-collapse: collapse;
      }
      .frontespizio {
        width: 100%;
        height: 100%;
        background-image: url("{{ 'file://' . public_path('pdf/frontespizio-bg.jpg') }}");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: table;
      }
      .frontespizio-cell {
        height: 100%;
        vertical-align: middle;
        text-align: center;
      }
      .page.frontespizio {
        height: 100%;
      }
      .frontespizio-content {
        padding: 20% 10% 0 10%;
      }
      .frontespizio-center {
        height: 100%;
        width: 100%;
        display: table;
      }
      .frontespizio-center-cell {
        display: table-cell;
        vertical-align: middle;
        text-align: center;
      }
      .frontespizio-lines {
        text-align: center;
        font-size: 18px;
        line-height: 1.35;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
      }
      .frontespizio-line {
        display: block;
        margin: 0 0 10px 0;
      }
      .frontespizio-line:last-child {
        margin-bottom: 0;
      }
      .frontespizio-label {
        color: #95817b;
        font-weight: 600;
        padding: 0;
        line-height: 1.2em;
        text-align: center !important;
      }
      .frontespizio-info {
        width: 60%;
        border-collapse: collapse;
        margin: 0 auto;
      }
      .frontespizio-info tr {
        border-bottom: 1px solid #95817b;
      }
      .frontespizio-info td {
        padding: 8px 0;
      }
      .frontespizio-info .info-label {
        text-transform: uppercase;
        font-size: 14px;
        line-height:16px;
        letter-spacing: 0.08em;
        color: #95817b;
        text-align: left;
      }
      .frontespizio-info .info-value {
        text-align: right;
        font-size: 17px;
        line-height: 19px;
        color: #95817b;
      }
      .frontespizio-logo {
        margin: 0 auto 25% auto;
        text-align: center;
      }
      .frontespizio-logo img {
        width: 40%;
        height: auto;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <section class="page frontespizio">
      @php
        $quoteTypeLabel = match ($quote->quote_type) {
            'FP' => 'Fornitura e Posa in opera',
            'AS' => 'Assistenza',
            'VM' => 'Vendita Materiale',
            default => $quote->quote_type,
        };
      @endphp
      <table class="frontespizio-wrap">
        <tr>
          <td class="frontespizio-cell">
            <div class="frontespizio-center">
              <div class="frontespizio-center-cell">
                <div class="frontespizio-content">
                  <div class="frontespizio-logo">
                    <img src="{{ 'file://' . public_path('pdf/logo-md.png') }}" alt="MD Italia" />
                  </div>
                  <div class="frontespizio-subtitle">Preventivo</div>
                  <h1>{{ $quoteTypeLabel }}</h1>
                  <table class="frontespizio-info">
                    <tr>
                      <td class="info-label">PROT. NUMERO</td>
                      <td class="info-value">{{ $quote->prot_internal ?? $quote->prot_display }}</td>
                    </tr>
                    <tr>
                      <td class="info-label">DATA</td>
                      <td class="info-value">{{ $quote->date }}</td>
                    </tr>
                    <tr>
                      <td class="info-label">CLIENTE</td>
                      <td class="info-value">{{ $quote->customer_title_snapshot }}</td>
                    </tr>
                    <tr>
                      <td class="info-label">CANTIERE</td>
                      <td class="info-value">{{ $quote->cantiere }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </section>
  </body>
</html>
