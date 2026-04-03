<?php

namespace Tests\Unit;

use App\Support\ProductNameHtmlSanitizer;
use PHPUnit\Framework\TestCase;

class ProductNameHtmlSanitizerTest extends TestCase
{
    public function test_it_keeps_only_supported_markup(): void
    {
        $sanitizer = new ProductNameHtmlSanitizer();

        $sanitized = $sanitizer->sanitize('  <strong class="x">Voce</strong> <script>alert(1)</script> <em>extra</em> ');

        $this->assertSame('<strong>Voce</strong> alert(1) extra', $sanitized);
    }

    public function test_it_returns_empty_string_for_blank_input(): void
    {
        $sanitizer = new ProductNameHtmlSanitizer();

        $this->assertSame('', $sanitizer->sanitize('   '));
    }
}
