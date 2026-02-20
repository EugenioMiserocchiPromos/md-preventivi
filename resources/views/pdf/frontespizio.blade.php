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
        font-size: 36px;
        margin: 0 0 14px 0;
        line-height: 1.2;
        text-transform: uppercase;
        color: #b91c1c;
      }
      .frontespizio-wrap {
        width: 100%;
        height: 100%;
        border-collapse: collapse;
      }
      .frontespizio {
        width: 100%;
        height: 100%;
        background-image: url("{{ 'file://' . public_path('pdf/frontespizio-bg.png') }}");
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
        padding: 40% 10% 0 10%;
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
      .frontespizio-box {
        border: 1px solid #babec2;
        border-radius: 50px;
        padding: 14px 18px;
        margin: 0 auto;
        width: 80%;
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
        color: #b91c1c;
        font-weight: 600;
        padding: 0;
        line-height: 1.2em;
        text-align: center !important;
      }
    </style>
  </head>
  <body>
    <section class="page frontespizio">
      <table class="frontespizio-wrap">
        <tr>
          <td class="frontespizio-cell">
            <div class="frontespizio-center">
              <div class="frontespizio-center-cell">
                <div class="frontespizio-content">
                  <h1>{{ $quote->title_text }}</h1>
                  <div class="frontespizio-box">
                    <div class="frontespizio-lines prot">
                      <div class="frontespizio-line"><span class="frontespizio-label">PROT:</span> {{ $quote->prot_internal ?? $quote->prot_display }}</div>
                      <div class="frontespizio-line"><span class="frontespizio-label">Cliente:</span> {{ $quote->customer_title_snapshot }}</div>
                      <div class="frontespizio-line"><span class="frontespizio-label">Data:</span> {{ $quote->date }}</div>
                      <div class="frontespizio-line"><span class="frontespizio-label">Cantiere:</span> {{ $quote->cantiere }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </section>
  </body>
</html>
