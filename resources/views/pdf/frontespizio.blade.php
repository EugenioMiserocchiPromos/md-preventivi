<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Preventivo {{ $quote->prot_display }}</title>
    <style>
      body {
        font-family: DejaVu Sans, sans-serif;
        font-size: 14px;
        color: #0f172a;
        margin: 40px;
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
        margin-top: 18px;
      }
      .label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        margin-bottom: 4px;
      }
      .value {
        font-size: 16px;
        line-height: 1.35;
        word-wrap: break-word;
        white-space: pre-wrap;
      }
      .prot {
        font-size: 18px;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
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
  </body>
</html>
