<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\UserMatch;
use App\Models\User;
use App\Enums\RatingDirection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RatingController extends Controller
{
    public function create(Request $request)
    {
        $userMatchId = $request->get('userMatchId');
        $userMatch = UserMatch::with(['application.offer.company', 'application.applicant', 'application.offer.offerer'])->findOrFail($userMatchId);
        
        $user = Auth::user();
        $application = $userMatch->application;
        $offer = $application->offer;
        
        // Prüfe Berechtigung
        if ($user->id !== $application->applicant_id && $user->id !== $offer->offerer_id) {
            abort(403, 'Unbefugter Zugriff.');
        }
        
        $isApplicant = $application->applicant_id === $user->id;
        $partner = $isApplicant ? $offer->offerer : $application->applicant;
        
        return Inertia::render('ratings/create', [
            'userMatch' => [
                'id' => $userMatch->id,
                'title' => $offer->title,
                'company_name' => $offer->company->name,
                'partner_name' => $partner->name,
                'is_applicant' => $isApplicant,
            ],
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'user_match_id' => 'required|exists:user_matches,id',
            'score' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);
        
        $userMatch = UserMatch::with(['application.offer'])->findOrFail($request->user_match_id);
        $user = Auth::user();
        $application = $userMatch->application;
        $offer = $application->offer;
        
        // Prüfe Berechtigung
        if ($user->id !== $application->applicant_id && $user->id !== $offer->offerer_id) {
            abort(403, 'Unbefugter Zugriff.');
        }
        
        $isApplicant = $application->applicant_id === $user->id;
        $direction = $isApplicant ? RatingDirection::APPLICANT_TO_OFFERER : RatingDirection::OFFERER_TO_APPLICANT;
        
        // Prüfe ob bereits eine Bewertung existiert
        $existingRating = Rating::where('user_match_id', $userMatch->id)
            ->where('direction', $direction->value)
            ->first();
            
        if ($existingRating) {
            return redirect()->route('web.ratings.show', $existingRating->id)
                ->with('info', 'Sie haben bereits eine Bewertung abgegeben.');
        }
        
        $rating = Rating::create([
            'user_match_id' => $userMatch->id,
            'direction' => $direction->value,
            'score' => $request->score,
            'comment' => $request->comment,
        ]);
        
        return redirect()->route('web.ratings.show', $rating->id)
            ->with('success', 'Bewertung erfolgreich abgegeben.');
    }
    
    public function show($id)
    {
        $rating = Rating::with(['userMatch.application.offer.company', 'userMatch.application.applicant', 'userMatch.application.offer.offerer'])->findOrFail($id);
        $user = Auth::user();
        $userMatch = $rating->userMatch;
        $application = $userMatch->application;
        $offer = $application->offer;
        
        // Prüfe Berechtigung
        if ($user->id !== $application->applicant_id && $user->id !== $offer->offerer_id) {
            abort(403, 'Unbefugter Zugriff.');
        }
        
        $isApplicant = $application->applicant_id === $user->id;
        $partner = $isApplicant ? $offer->offerer : $application->applicant;
        
        return Inertia::render('ratings/show', [
            'rating' => [
                'id' => $rating->id,
                'score' => $rating->score,
                'comment' => $rating->comment,
                'created_at' => $rating->created_at->format('Y-m-d H:i:s'),
                'user_match_id' => $userMatch->id,
                'title' => $offer->title,
                'company_name' => $offer->company->name,
                'partner_name' => $partner->name,
                'is_applicant' => $isApplicant,
            ],
        ]);
    }
    
    public function userIndex($userId)
    {
        $user = User::findOrFail($userId);
        
        $ratings = DB::table('ratings')
            ->join('user_matches', 'ratings.user_match_id', '=', 'user_matches.id')
            ->join('applications', 'user_matches.application_id', '=', 'applications.id')
            ->join('offers', 'applications.offer_id', '=', 'offers.id')
            ->where(function ($query) use ($userId) {
                $query->where(function ($q) use ($userId) {
                    // User ist Offerer und bekommt Bewertung vom Applicant
                    $q->where('offers.offerer_id', $userId)
                      ->where('ratings.direction', 'applicant_to_offerer');
                })->orWhere(function ($q) use ($userId) {
                    // User ist Applicant und bekommt Bewertung vom Offerer
                    $q->where('applications.applicant_id', $userId)
                      ->where('ratings.direction', 'offerer_to_applicant');
                });
            })
            ->select('ratings.score', 'ratings.comment', 'ratings.created_at')
            ->orderBy('ratings.created_at', 'desc')
            ->paginate(20);
            
        return Inertia::render('ratings/user-index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'average_rating' => $user->average_rating,
            ],
            'ratings' => $ratings,
        ]);
    }
}