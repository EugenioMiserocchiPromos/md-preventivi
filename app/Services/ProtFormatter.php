<?php

namespace App\Services;

class ProtFormatter
{
    public function makeDisplay(string $initials, string $quoteType, int $protNumber, int $protYear): string
    {
        $padded = str_pad((string) $protNumber, 4, '0', STR_PAD_LEFT);
        $yearShort = substr((string) $protYear, -2);

        return sprintf('%s/%s %s-%s', $initials, strtoupper($quoteType), $padded, $yearShort);
    }

    public function makeInternal(string $display, int $revisionNumber): string
    {
        return sprintf('%s-REV%d', $display, $revisionNumber);
    }
}
