<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\UserMatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserMatchController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $userMatches = UserMatch::with([
            'application.offer.company',
            'application.offer.offerer',
            'application.applicant',
            'affiliateLink'
        ])
        ->whereHas('application', function ($query) use ($user) {
            $query->where('applicant_id', $user->id)
                  ->orWhereHas('offer', function ($offerQuery) use ($user) {
                      $offerQuery->where('offerer_id', $user->id);
                  });
        })
        ->latest('created_at')
        ->get()
        ->map(function ($userMatch) use ($user) {
            $application = $userMatch->application;
            $offer = $application->offer;
            $isApplicant = $application->applicant_id === $user->id;

            // Berechne Belohnung für eingeloggten User (wie in OfferCard)
            $rewardTotalEuro = $offer->reward_total_cents / 100;
            $userReward = $isApplicant
                ? (1 - $offer->reward_offerer_percent) * $offer->reward_total_cents / 100
                : $offer->reward_offerer_percent * $offer->reward_total_cents / 100;

            // Bestimme Partner und Rollen
            $partner = $isApplicant ? $offer->offerer : $application->applicant;
            $userRole = null;
            $partnerRole = null;

            if ($offer->offerer_type === 'referrer') {
                $userRole = $isApplicant ? 'referred' : 'referrer';
                $partnerRole = $isApplicant ? 'referrer' : 'referred';
            } else {
                $userRole = $isApplicant ? 'referrer' : 'referred';
                $partnerRole = $isApplicant ? 'referred' : 'referrer';
            }

            // Bestimme success_status basierend auf User-Typ
            $successStatus = $isApplicant
                ? $userMatch->success_status_applicant
                : $userMatch->success_status_offerer;

            // Bestimme Archivierungsstatus
            $isArchived = $isApplicant
                ? $userMatch->is_archived_by_applicant
                : $userMatch->is_archived_by_offerer;

            $isArchivedByPartner = $isApplicant
                ? $userMatch->is_archived_by_offerer
                : $userMatch->is_archived_by_applicant;

            return [
                'id' => $userMatch->id,
                'title' => $offer->title,
                'company_name' => $offer->company->name,
                'status' => $userMatch->status,
                'success_status' => $successStatus,
                'created_at' => $userMatch->created_at->format('Y-m-d H:i:s'),
                'is_applicant' => $isApplicant,
                'user_role' => $userRole,
                'partner_name' => $partner->name,
                'partner_role' => $partnerRole,
                'user_reward' => $userReward,
                'is_archived' => $isArchived,
                'is_archived_by_partner' => $isArchivedByPartner,
                'partner_action' => $this->getPartnerMatchAction($userMatch, $isApplicant),
            ];
        });

        return Inertia::render('user-matches/modern-index', [
            'userMatches' => $userMatches,
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        $userMatch = UserMatch::with([
            'application.offer.company',
            'application.offer.offerer',
            'application.applicant',
            'affiliateLink'
        ])->findOrFail($id);

        $application = $userMatch->application;
        $offer = $application->offer;

        // Prüfe Berechtigung
        if ($user->id !== $application->applicant_id && $user->id !== $offer->offerer_id) {
            abort(403, 'Unbefugter Zugriff.');
        }

        $isApplicant = $application->applicant_id === $user->id;

        // Berechne Belohnung für eingeloggten User (wie in OfferCard)
        $rewardTotalEuro = $offer->reward_total_cents / 100;
        $userReward = $isApplicant
            ? (1 - $offer->reward_offerer_percent) * $offer->reward_total_cents / 100
            : $offer->reward_offerer_percent * $offer->reward_total_cents / 100;

        $userRewardPercent = $offer->reward_offerer_percent * 100;

        // Bestimme Partner und Rollen
        $partner = $isApplicant ? $offer->offerer : $application->applicant;

        $partnerReward = $offer->reward_total_cents / 100 - $userReward;

        $partnerRewardPercent = (1- $offer->reward_offerer_percent) * 100;

        $userRole = null;
        $partnerRole = null;

        if ($offer->offerer_type === 'referrer') {
            $userRole = $isApplicant ? 'referred' : 'referrer';
            $partnerRole = $isApplicant ? 'referrer' : 'referred';
        } else {
            $userRole = $isApplicant ? 'referrer' : 'referred';
            $partnerRole = $isApplicant ? 'referred' : 'referrer';
        }

        // Bestimme success_status basierend auf User-Typ
        $successStatus = $isApplicant
            ? $userMatch->success_status_applicant
            : $userMatch->success_status_offerer;

        // Bestimme Archivierungsstatus für Show-View
        $isArchivedByPartner = $isApplicant
            ? $userMatch->is_archived_by_offerer
            : $userMatch->is_archived_by_applicant;

        return Inertia::render('user-matches/show', [
            'userMatch' => [
                'id' => $userMatch->id,
                'title' => $offer->title,
                'description' => $offer->description,
                'company_name' => $offer->company->name,
                'affiliate_url' => $userMatch->affiliateLink->url ?? null,
                'status' => $userMatch->status,
                'success_status' => $successStatus,
                'created_at' => $userMatch->created_at->format('Y-m-d H:i:s'),
                'is_applicant' => $isApplicant,
                'user_name' => $user->name,
                'user_role' => $userRole,
                'partner_name' => $partner->name,
                'partner_role' => $partnerRole,
                'reward_total_euro' => $rewardTotalEuro,
                'user_reward' => $userReward,
                'user_reward_percent' => $userRewardPercent,
                'partner_reward_percent' => $partnerRewardPercent,
                'partner_reward' => $partnerReward,
                'application_message' => $application->message,
                'is_archived_by_partner' => $isArchivedByPartner,
                'partner_action' => $this->getPartnerMatchAction($userMatch, $isApplicant),
                'user_rating_id' => $this->getUserRatingId($userMatch, $isApplicant),
            ],
        ]);
    }

    public function markSuccessful($id)
    {
        $userMatch = UserMatch::findOrFail($id);
        $user = Auth::user();
        $application = $userMatch->application;
        $offer = $application->offer;

        // Prüfe Berechtigung
        if ($user->id !== $application->applicant_id &&
            $user->id !== $offer->offerer_id) {
            abort(403, 'Unbefugter Zugriff.');
        }

        // Bestimme ob User Applicant oder Offerer ist
        $isApplicant = $application->applicant_id === $user->id;

        // Update basierend auf User-Typ
        // $updateData = ['status' => 'closed'];
        if ($isApplicant) {
            $updateData['success_status_applicant'] = 'successful';
        } else {
            $updateData['success_status_offerer'] = 'successful';
        }

        $userMatch->update($updateData);

        return redirect()->route('web.user-matches.index')
            ->with('success', 'Match als erfolgreich markiert.');
    }

    public function dissolve($id)
    {
        $userMatch = UserMatch::findOrFail($id);
        $user = Auth::user();
        $application = $userMatch->application;
        $offer = $application->offer;

        // Prüfe Berechtigung
        if ($user->id !== $application->applicant_id &&
            $user->id !== $offer->offerer_id) {
            abort(403, 'Unbefugter Zugriff.');
        }

        // Bestimme ob User Applicant oder Offerer ist
        $isApplicant = $application->applicant_id === $user->id;

        // Update basierend auf User-Typ
        // $updateData = ['status' => 'closed'];
        if ($isApplicant) {
            $updateData['success_status_applicant'] = 'unsuccessful';
        } else {
            $updateData['success_status_offerer'] = 'unsuccessful';
        }

        $userMatch->update($updateData);

        return redirect()->route('web.user-matches.index')
            ->with('success', 'Match aufgelöst.');
    }

    public function archive($id)
    {
        $userMatch = UserMatch::findOrFail($id);
        $user = Auth::user();
        $application = $userMatch->application;
        $offer = $application->offer;

        // Prüfe Berechtigung
        if ($user->id !== $application->applicant_id &&
            $user->id !== $offer->offerer_id) {
            abort(403, 'Unbefugter Zugriff.');
        }

        // Bestimme ob User Applicant oder Offerer ist
        $isApplicant = $application->applicant_id === $user->id;

        // Setze entsprechendes Archivierungsfeld
        if ($isApplicant) {
            $userMatch->update(['is_archived_by_applicant' => true]);
        } else {
            $userMatch->update(['is_archived_by_offerer' => true]);
        }

        return redirect()->route('web.user-matches.index')
            ->with('success', 'Match archiviert.');
    }

    public function unarchive($id)
    {
        $userMatch = UserMatch::findOrFail($id);
        $user = Auth::user();
        $application = $userMatch->application;
        $offer = $application->offer;

        // Prüfe Berechtigung
        if ($user->id !== $application->applicant_id &&
            $user->id !== $offer->offerer_id) {
            abort(403, 'Unbefugter Zugriff.');
        }

        // Bestimme ob User Applicant oder Offerer ist
        $isApplicant = $application->applicant_id === $user->id;

        // Entferne entsprechendes Archivierungsfeld
        if ($isApplicant) {
            $userMatch->update(['is_archived_by_applicant' => false]);
        } else {
            $userMatch->update(['is_archived_by_offerer' => false]);
        }

        return redirect()->route('web.user-matches.index')
            ->with('success', 'Match wiederhergestellt.');
    }

    public function report($id)
    {
        // Placeholder für Melden-Funktionalität
        console_log("Match $id wurde gemeldet");

        return redirect()->route('web.user-matches.index')
            ->with('info', 'Match wurde gemeldet.');
    }

    /**
     * Get partner match action description
     */
    private function getPartnerMatchAction($userMatch, $isApplicant)
    {
        $isArchivedByPartner = $isApplicant ? $userMatch->is_archived_by_offerer : $userMatch->is_archived_by_applicant;

        if ($isArchivedByPartner) {
            return 'Ihr Partner hat den Match archiviert';
        }

        // Prüfe Application-Aktionen
        $application = $userMatch->application;
        $applicationAction = $this->getPartnerApplicationAction($application, $isApplicant);
        if ($applicationAction) {
            return $applicationAction;
        }

        $partnerSuccessStatus = $isApplicant ? $userMatch->success_status_offerer : $userMatch->success_status_applicant;

        switch ($partnerSuccessStatus) {
            case 'successful':
                return 'Ihr Partner hat den Match als erfolgreich markiert';
            case 'unsuccessful':
                return 'Ihr Partner hat den Match aufgelöst';
            default:
                return null;
        }
    }

    /**
     * Get partner application action description
     */
    private function getPartnerApplicationAction($application, $isApplicant)
    {
        $status = $application->status;
        $isArchivedByPartner = $isApplicant ? $application->is_archived_by_offerer : $application->is_archived_by_applicant;

        if ($isArchivedByPartner) {
            return 'Ihr Partner hat die Application archiviert';
        }

        switch ($status) {
            case 'approved':
                return $isApplicant ? 'Ihr Partner hat die Application genehmigt' : null;
            case 'rejected':
                return $isApplicant ? 'Ihr Partner hat die Application abgelehnt' : null;
            case 'retracted':
                return !$isApplicant ? 'Ihr Partner hat die Application zurückgezogen' : null;
            default:
                return null;
        }
    }

    /**
     * Get user's rating ID if exists
     */
    private function getUserRatingId($userMatch, $isApplicant)
    {
        $direction = $isApplicant ? 'applicant_to_offerer' : 'offerer_to_applicant';

        $rating = \App\Models\Rating::where('user_match_id', $userMatch->id)
            ->where('direction', $direction)
            ->first();

        return $rating ? $rating->id : null;
    }
}
