<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\ApplicationController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\OfferController;
use App\Http\Controllers\Web\UserMatchController;
use App\Http\Controllers\Api\V1\OfferController as ApiOfferController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Offers
    Route::prefix('offers')->name('web.offers.')->group(function () {
        Route::get('/', [OfferController::class, 'index'])->name('index');
        Route::get('/create', [OfferController::class, 'create'])->name('create');
        Route::post('/', [OfferController::class, 'store'])->name('store');
        Route::get('/{id}', [OfferController::class, 'show'])->name('show');
        Route::get('/{id}/edit', [OfferController::class, 'edit'])->name('edit');
        Route::put('/{id}', [OfferController::class, 'update'])->name('update');
        Route::delete('/{id}', [OfferController::class, 'destroy'])->name('destroy');

        // Applications for offers
        Route::post('/{id}/apply', [OfferController::class, 'apply'])->name('apply');
    });

    // My Offers
    Route::get('/my-offers', [OfferController::class, 'myOffers'])->name('web.offers.my-offers');
    Route::post('/my-offers/{id}/status', [OfferController::class, 'updateStatus'])->name('web.offers.update-status');
    Route::get('/my-offers/{id}/edit', [OfferController::class, 'edit'])->name('web.offers.edit');
    Route::put('/my-offers/{id}', [OfferController::class, 'update'])->name('web.offers.update');

    // Applications
    Route::prefix('applications')->name('web.applications.')->group(function () {
        Route::get('/', [ApplicationController::class, 'index'])->name('index');
        Route::get('/create/{offer_id}', [ApplicationController::class, 'create'])->name('create');
        Route::post('/store/{offer_id}', [ApplicationController::class, 'store'])->name('store');
        Route::get('/{id}', [ApplicationController::class, 'show'])->name('show');
        Route::post('/{id}/approve', [ApplicationController::class, 'approve'])->name('approve');
        Route::post('/{id}/reject', [ApplicationController::class, 'reject'])->name('reject');
        Route::post('/{id}/retract', [ApplicationController::class, 'retract'])->name('retract');
        Route::post('/{id}/reapply', [ApplicationController::class, 'reapply'])->name('reapply');
        Route::post('/{id}/archive', [ApplicationController::class, 'archive'])->name('archive');
        Route::post('/{id}/unarchive', [ApplicationController::class, 'unarchive'])->name('unarchive');
        Route::post('/{id}/mark-read', [ApplicationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/{id}/toggle-read', [ApplicationController::class, 'toggleReadStatus'])->name('toggle-read');
        Route::get('/{id}/check-user-match', [ApplicationController::class, 'checkUserMatch'])->name('check-user-match');
        Route::post('/{id}/retract-with-match', [ApplicationController::class, 'retractWithMatch'])->name('retract-with-match');
        Route::post('/{id}/reject-with-match', [ApplicationController::class, 'rejectWithMatch'])->name('reject-with-match');
        Route::post('/{id}/archive-with-match', [ApplicationController::class, 'archiveWithMatch'])->name('archive-with-match');
    });

    // User Matches
    Route::prefix('user-matches')->name('web.user-matches.')->group(function () {
        Route::get('/', [UserMatchController::class, 'index'])->name('index');
        Route::get('/{id}', [UserMatchController::class, 'show'])->name('show');
        Route::post('/{id}/mark-successful', [UserMatchController::class, 'markSuccessful'])->name('mark-successful');
        Route::post('/{id}/dissolve', [UserMatchController::class, 'dissolve'])->name('dissolve');
        Route::post('/{id}/archive', [UserMatchController::class, 'archive'])->name('archive');
        Route::post('/{id}/unarchive', [UserMatchController::class, 'unarchive'])->name('unarchive');
        Route::post('/{id}/report', [UserMatchController::class, 'report'])->name('report');
    });

    // Ratings
    Route::prefix('ratings')->name('web.ratings.')->group(function () {
        Route::get('/create', [\App\Http\Controllers\Web\RatingController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Web\RatingController::class, 'store'])->name('store');
        Route::get('/user/{userId}', [\App\Http\Controllers\Web\RatingController::class, 'userIndex'])->name('user-index');
        Route::get('/{id}', [\App\Http\Controllers\Web\RatingController::class, 'show'])->name('show');
    });

    // API Routes
    Route::get('/offers-fetch-more', [ApiOfferController::class, 'fetchMore'])->name('api.v1.offers.fetch-more');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
