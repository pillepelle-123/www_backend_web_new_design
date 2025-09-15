<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Offer;
use App\Models\Company;
use Illuminate\Support\Facades\Auth;

class OfferController extends Controller
{
    // public function index() {
    //     return Inertia::render('offers/index', []);
    // }
    public function index(Request $request)
    {
        $perPage = 20; // Anzahl der Datensätze pro Seite

        $query = Offer::query()
            ->with(['offerer', 'company'])
            ->where('offers.admin_status', 'active')
            ->whereIn('offers.status', ['live', 'matched']); // Hard filter for active and live/matched offers

        // Global search
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        // Filter search (case-insensitive)
        if ($request->has('title') && !empty($request->title)) {
            $query->where('title', 'ilike', '%' . $request->title . '%');
        }

        if ($request->has('company') && !empty($request->company)) {
            $query->whereHas('company', function($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->company . '%');
            });
        }

        // Filter
        if ($request->has('type') && !empty($request->type)) {
            $type = $request->type === 'Werbender' ? 'referrer' : 'referred';
            $query->where('offerer_type', $type);
        }

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('rating') && $request->rating > 0) {
            $query->whereHas('offerer', function($q) use ($request) {
                $q->where('average_rating', '>=', $request->rating);
            });
        }

        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        // Sortierung
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('order', 'desc');

        // Mapping der Frontend-Sortierfelder zu Datenbankfeldern
        $sortFieldMap = [
            'created_at' => 'created_at',
            'title' => 'title',
            'reward_total_cents' => 'reward_total_cents',
            'reward_offerer_percent' => 'reward_offerer_percent',
            'average_rating' => 'users.average_rating'
        ];

        // Standardsortierung nach created_at, wenn kein gültiges Sortierfeld angegeben wurde
        $dbSortField = $sortFieldMap[$sortField] ?? 'created_at';

        // Spezielle Sortierung für Felder aus verknüpften Tabellen
        if ($dbSortField === 'users.average_rating') {
            $query->join('users', 'offers.offerer_id', '=', 'users.id')
                  ->select('offers.*')
                  ->where('offers.admin_status', 'active'); // Re-apply admin_status filter after join
        }

        // Handle NULL values in sorting and add secondary sort for consistency
        if ($dbSortField === 'created_at') {
            $query->orderByRaw("created_at {$sortDirection} NULLS LAST")
                  ->orderBy('id', $sortDirection);
        } else {
            $query->orderBy($dbSortField, $sortDirection)
                  ->orderBy('id', $sortDirection);
        }

        // Paginierung
        $offers = $query->paginate($perPage);

        // Transformation der Daten
        $offersData = $offers->through(function ($offer) {
            return [
                'id' => $offer->id,
                'title' => $offer->title,
                'description' => $offer->description,
                'offerer_type' => $offer->offerer_type == 'referrer' ? 'Werbender' : 'Beworbener',
                'offer_user' => $offer->user->name,
                'offer_company' => $offer->company->name,
                'logo_path' => $offer->company->logo_path,
                'reward_total_cents' => $offer->reward_total_cents,
                'reward_offerer_percent' => $offer->reward_offerer_percent,
                'status' => $offer->status,
                'created_at' => $offer->created_at->format('Y-m-d H:i:s'),
                'average_rating' => $offer->user->average_rating,
                'industry' => $offer->company->industry,
                'offerer_id' => $offer->offerer_id,
                'offerer_id' => $offer->offerer_id,
            ];
        });

        return Inertia::render('offers/modern-index', [
            'offers' => $offersData,
            'pagination' => [
                'current_page' => $offers->currentPage(),
                'last_page' => $offers->lastPage(),
                'per_page' => $offers->perPage(),
                'total' => $offers->total(),
            ],
            'search' => $request->input('search', ''),
            'filters' => [
                'title' => $request->input('title', ''),
                'company' => $request->input('company', ''),
                'type' => $request->input('type', ''),
                'status' => $request->input('status', ''),
                'rating' => $request->input('rating', 0),
                'date_from' => $request->input('date_from', ''),
                'sort' => $request->input('sort', 'created_at'),
                'order' => $request->input('order', 'desc'),
                'show_filters' => $request->input('show_filters', ''),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $offer = Offer::with(['offerer', 'company'])->findOrFail($id);
        $user = Auth::user();

        // Prüfe, ob der Benutzer bereits eine Anfrage für dieses Angebot gestellt hat
        $application = \App\Models\Application::where('offer_id', $offer->id)
            ->where('applicant_id', $user->id)
            ->first();

        $offerData = [
            'id' => $offer->id,
            'title' => $offer->title,
            'description' => $offer->description,
            'offerer_type' => $offer->offerer_type == 'referrer' ? 'Werbender' : 'Beworbener',
            'offer_user' => $offer->offerer->name,
            'offer_company' => $offer->company->name,
            'logo_path' => $offer->company->logo_path,
            'reward_total_cents' => $offer->reward_total_cents,
            'reward_offerer_percent' => $offer->reward_offerer_percent,
            'status' => $offer->status,
            'industry' => $offer->company->industry,
            'created_at' => $offer->created_at->format('Y-m-d H:i:s'),
            'average_rating' => $offer->offerer->average_rating,
            'has_application' => $application ? true : false,
            'application_status' => $application ? $application->status : null,
            'application_id' => $application ? $application->id : null,
            'is_offerer' => $user->id === $offer->offerer_id,
        ];

        return Inertia::render('offers/show', [
            'offer' => $offerData,
            'returnUrl' => $request->input('return', ''),
        ]);
    }

    public function create()
    {
        $companies = Company::select('id', 'name')->get();
        return inertia('offers/create', [
            'companies' => $companies
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company_id' => 'required|exists:companies,id',
            'reward_total_cents' => 'required|integer|min:0|max:100000',
            'reward_offerer_percent' => 'required|numeric|min:0|max:1', // Dezimalwert, z.B. 0.5
            'offerer_type' => 'required|in:referrer,referred',
        ]);

        $offer = Offer::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'company_id' => $validated['company_id'],
            'reward_total_cents' => $validated['reward_total_cents'],
            'reward_offerer_percent' => $validated['reward_offerer_percent'],
            'offerer_id' => Auth::id(),
            'status' => 'live',
            'offerer_type' => $validated['offerer_type'],
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('web.offers.index')
            ->with('success', 'Offer created successfully.');
    }

    public function myOffers(Request $request)
    {
        $perPage = 20;
        $user = Auth::user();

        $query = Offer::query()
            ->with(['company'])
            ->where('offerer_id', $user->id);

        // Global search
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        // Filter search
        if ($request->has('title') && !empty($request->title)) {
            $query->where('title', 'ilike', '%' . $request->title . '%');
        }

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Sortierung
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('order', 'desc');

        $query->orderBy($sortField, $sortDirection);

        $offers = $query->paginate($perPage);

        $offersData = $offers->map(function ($offer) {
            return [
                'id' => $offer->id,
                'title' => $offer->title,
                'company_name' => $offer->company->name,
                'offerer_type' => $offer->offerer_type,
                'offerer_type_label' => $offer->offerer_type == 'referrer' ? 'Werbender' : 'Beworbener',
                'status' => $offer->status,
                'status_label' => match($offer->status) {
                    'draft' => 'Entwurf',
                    'live' => 'Live',
                    'hidden' => 'Versteckt',
                    'matched' => 'Gematcht',
                    'deleted' => 'Archiviert',
                    default => ucfirst($offer->status)
                },
                'reward_total_cents' => $offer->reward_total_cents,
                'reward_offerer_percent' => $offer->reward_offerer_percent,
                'created_at' => $offer->created_at->format('Y-m-d H:i:s'),
                'is_archived' => $offer->status === 'deleted',
            ];
        });

        return Inertia::render('my-offers/modern-index', [
            'offers' => $offersData,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $offer = Offer::where('id', $id)
            ->where('offerer_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:draft,live,hidden,deleted'
        ]);

        $offer->update(['status' => $validated['status']]);

        return redirect()->route('web.offers.my-offers')
            ->with('success', 'Status updated successfully.');
    }

    public function edit($id)
    {
        $offer = Offer::where('id', $id)
            ->where('offerer_id', Auth::id())
            ->firstOrFail();

        $companies = Company::select('id', 'name')->get();

        return Inertia::render('offers/edit', [
            'offer' => $offer,
            'companies' => $companies
        ]);
    }

    public function update(Request $request, $id)
    {
        $offer = Offer::where('id', $id)
            ->where('offerer_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'company_id' => 'required|exists:companies,id',
            'reward_total_euros' => 'required|numeric|min:0|max:1000',
            'reward_offerer_percent' => 'required|numeric|min:0|max:1',
            'offerer_type' => 'required|in:referrer,referred',
        ]);

        $offer->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'company_id' => $validated['company_id'],
            'reward_total_cents' => $validated['reward_total_euros'] * 100,
            'reward_offerer_percent' => $validated['reward_offerer_percent'],
            'offerer_type' => $validated['offerer_type'],
        ]);

        return redirect()->route('web.offers.my-offers')
            ->with('success', 'Offer updated successfully.');
    }

}
