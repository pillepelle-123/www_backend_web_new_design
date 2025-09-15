<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Application;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $activeOffersCount = Offer::where('admin_status', 'active')->count();
        
        $newOffersLast7Days = Offer::where('admin_status', 'active')
            ->where(function($query) {
                $query->where('created_at', '>', now()->subDays(7))
                      ->orWhere('updated_at', '>', now()->subDays(7));
            })
            ->count();
        
        $totalApplicationsCount = Application::whereHas('offer', function($query) {
            $query->where('offerer_id', Auth::id());
        })->orWhere('applicant_id', Auth::id())->count();
        
        return Inertia::render('dashboard', [
            'activeOffersCount' => $activeOffersCount,
            'newOffersLast7Days' => $newOffersLast7Days,
            'totalApplicationsCount' => $totalApplicationsCount,
        ]);
        // Note: unreadApplicationsCount is already provided globally via HandleInertiaRequests middleware
    }
}