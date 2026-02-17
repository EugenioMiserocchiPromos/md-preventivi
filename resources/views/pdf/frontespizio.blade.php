<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Preventivo {{ $quote->prot_display }}</title>
    <style>
      @page {
        margin: 36px 40px 24px 40px;
      }
      html,
      body {
        height: 100%;
      }
      body {
        font-family: DejaVu Sans, sans-serif;
        font-size: 12px;
        color: #0f172a;
        margin: 0;
      }
      h1 {
        font-size: 26px;
        margin: 0 0 14px 0;
        line-height: 1.2;
        text-transform: uppercase;
        color: #b91c1c;
      }
      .subtitle {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #475569;
        margin-bottom: 8px;
      }
      .frontespizio-wrap {
        width: 100%;
        height: 100%;
        border-collapse: collapse;
      }
      .frontespizio-cell {
        vertical-align: middle;
        text-align: center;
      }
      .frontespizio-content {
        padding-top: 10%;
      }
      .frontespizio-box {
        border: 1px solid #babec2;
        border-radius: 50px;
        padding: 14px 18px;
        margin: 0 auto;
        width: 80%;
      }
      .frontespizio-lines {
        display: flex;
        justify-content: center;
        text-align: center;
        font-size: 18px;
        line-height: 1.25;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
      }
      .frontespizio-label {
        color: #b91c1c;
        font-weight: 600;
        margin-bottom: 50px;
        padding: 0;
        line-height: 1.2em;
        min-width: 100% !important;
        text-align: center !important;
      }
    </style>
  </head>
  <body>
    <table class="frontespizio-wrap">
      <tr>
        <td class="frontespizio-cell">
          <div class="frontespizio-content">
            <div class="subtitle">Preventivo</div>
            <h1>{{ $quote->title_text }}</h1>
            <div class="frontespizio-box">
              <div class="frontespizio-lines prot">
                <span class="frontespizio-label">PROT:</span> {{ $quote->prot_internal ?? $quote->prot_display }}<br /><br />
                <span class="frontespizio-label">Cliente:</span> {{ $quote->customer_title_snapshot }}<br /><br />
                <span class="frontespizio-label">Data:</span> {{ $quote->date }}<br /><br />
                <span class="frontespizio-label">Cantiere:</span> {{ $quote->cantiere }}
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
