<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductComponentsImportController;
use App\Http\Controllers\Api\ProductComponentsController;
use App\Http\Controllers\Api\ProductImportController;
use App\Http\Controllers\Api\ProductsController;
use App\Http\Controllers\Api\CustomersController;
use App\Http\Controllers\Api\QuoteTitleTemplatesController;
use App\Http\Controllers\Api\QuotesController;
use App\Http\Controllers\Api\QuoteItemsController;
use App\Http\Controllers\Api\QuoteItemComponentsController;
use App\Http\Controllers\Api\QuoteItemPoseController;
use App\Http\Controllers\Api\QuotePricingController;
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

Route::middleware('auth:sanctum')->get('/quote-title-templates', [QuoteTitleTemplatesController::class, 'index']);
Route::middleware('auth:sanctum')->post('/quote-title-templates', [QuoteTitleTemplatesController::class, 'store']);
Route::middleware('auth:sanctum')->patch('/quote-title-templates/{template}', [QuoteTitleTemplatesController::class, 'update']);
Route::middleware('auth:sanctum')->delete('/quote-title-templates/{template}', [QuoteTitleTemplatesController::class, 'destroy']);

Route::middleware('auth:sanctum')->get('/quotes/{quote}', [QuotesController::class, 'show']);
Route::middleware('auth:sanctum')->post('/quotes', [QuotesController::class, 'store']);
Route::middleware('auth:sanctum')->get('/quotes', [QuotesController::class, 'index']);
Route::middleware('auth:sanctum')->post('/quotes/{quote}/items', [QuoteItemsController::class, 'store']);
Route::middleware('auth:sanctum')->patch('/quotes/{quote}/pricing', [QuotePricingController::class, 'update']);
Route::middleware('auth:sanctum')->patch('/quote-items/{item}', [QuoteItemsController::class, 'update']);
Route::middleware('auth:sanctum')->delete('/quote-items/{item}', [QuoteItemsController::class, 'destroy']);
Route::middleware('auth:sanctum')->patch('/quote-item-components/{component}', [QuoteItemComponentsController::class, 'update']);
Route::middleware('auth:sanctum')->put('/quote-items/{item}/pose', [QuoteItemPoseController::class, 'upsert']);
Route::middleware('auth:sanctum')->delete('/quote-items/{item}/pose', [QuoteItemPoseController::class, 'destroy']);
