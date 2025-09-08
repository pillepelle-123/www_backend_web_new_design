<?php

namespace App\Http\Middleware;

use App\Models\Application;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadApplicationsCount' => $request->user() ? $this->getUnreadApplicationsCount($request->user()) : 0,
        ];
    }

    /**
     * Get the count of unread applications for the authenticated user.
     */
    private function getUnreadApplicationsCount($user): int
    {
        return Application::join('offers', 'applications.offer_id', '=', 'offers.id')
            ->where(function ($query) use ($user) {
                $query->where('applications.applicant_id', $user->id)
                      ->orWhere('offers.offerer_id', $user->id);
            })
            ->where(function ($query) use ($user) {
                $query->where(function ($subQuery) use ($user) {
                    // Unread by applicant
                    $subQuery->where('applications.applicant_id', $user->id)
                             ->where('applications.is_read_by_applicant', false);
                })->orWhere(function ($subQuery) use ($user) {
                    // Unread by offerer
                    $subQuery->whereHas('offer', function ($offerQuery) use ($user) {
                        $offerQuery->where('offerer_id', $user->id);
                    })->where('applications.is_read_by_offerer', false);
                });
            })
            ->count();
    }
}
