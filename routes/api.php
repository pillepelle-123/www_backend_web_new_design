<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\Api\V1\UserController;
// use App\Http\Controllers\App\V1\CompanyController;
// use App\Http\Controllers\App\V1\OfferController;
use App\Http\Controllers\Api\V1\{UserController, CompanyController, OfferController, RatingController, UserMatchController, CompanyAiController};



Route::get('/user', function (Request $request) {
    return $request->user();
}); //->middleware('auth:sanctum');

Route::group(['prefix' => 'v1'], function() {
    Route::apiResource('users', UserController::class);
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('offers', OfferController::class);
    Route::apiResource('user_matches', UserMatchController::class);
    Route::apiResource('ratings', RatingController::class);
});

// AI-powered company lookup routes (outside middleware group)
Route::post('/api/companies/ai-lookup', [CompanyAiController::class, 'aiLookup']);
Route::post('/api/companies', [CompanyAiController::class, 'store']);
