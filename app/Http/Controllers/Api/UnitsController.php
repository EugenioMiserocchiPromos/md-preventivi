<?php

namespace App\Http\Controllers\Api;

use App\Support\Units;

class UnitsController
{
    public function index(): array
    {
        return Units::options();
    }
}
