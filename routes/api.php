<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductComponentsImportController;
use App\Http\Controllers\Api\ProductComponentsController;
use App\Http\Controllers\Api\ProductImportController;
use App\Http\Controllers\Api\ProductsController;
use App\Http\Controllers\Api\CustomersController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);

Route::middleware('auth:sanctum')->post('/products/import', [ProductImportController::class, 'import']);
Route::middleware('auth:sanctum')->post('/products/components/import', [ProductComponentsImportController::class, 'import']);
Route::middleware('auth:sanctum')->get('/products', [ProductsController::class, 'index']);
Route::middleware('auth:sanctum')->get('/products/{product}/components', [ProductComponentsController::class, 'index']);

Route::middleware('auth:sanctum')->get('/customers', [CustomersController::class, 'index']);
Route::middleware('auth:sanctum')->post('/customers', [CustomersController::class, 'store']);
Route::middleware('auth:sanctum')->patch('/customers/{customer}', [CustomersController::class, 'update']);
Route::middleware('auth:sanctum')->put('/customers/{customer}', [CustomersController::class, 'update']);
Route::middleware('auth:sanctum')->delete('/customers/{customer}', [CustomersController::class, 'destroy']);
