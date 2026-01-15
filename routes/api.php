<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductComponentsImportController;
use App\Http\Controllers\Api\ProductImportController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);

Route::middleware('auth:sanctum')->post('/products/import', [ProductImportController::class, 'import']);
Route::middleware('auth:sanctum')->post('/products/components/import', [ProductComponentsImportController::class, 'import']);
