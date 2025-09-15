<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyOffersController extends Controller
{
    public function index()
    {
        $offers = Offer::where('offerer_id', Auth::id())
            ->with(['company'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($offer) {
                return [
                    'id' => $offer->id,
                    'title' => $offer->title,
                    'company_name' => $offer->company->name ?? '',
                    'offerer_type' => $offer->offerer_type,
                    'offerer_type_label' => $offer->offerer_type_label,
                    'status' => $offer->status,
                    'status_label' => $offer->status_label,
                    'reward_total_cents' => $offer->reward_total_cents,
                    'reward_offerer_percent' => $offer->reward_offerer_percent,
                    'created_at' => $offer->created_at->toISOString(),
                    'is_archived' => $offer->status === 'deleted',
                ];
            });

        return Inertia::render('my-offers/modern-index', [
            'offers' => $offers,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $offer = Offer::where('id', $id)->where('offerer_id', Auth::id())->firstOrFail();
        
        $request->validate([
            'status' => 'required|in:live,hidden,deleted,draft'
        ]);

        $offer->update(['status' => $request->status]);

        return redirect()->back();
    }

    public function edit($id)
    {
        $offer = Offer::where('id', $id)->where('offerer_id', Auth::id())->firstOrFail();
        $companies = Company::all();

        return Inertia::render('offers/edit', [
            'offer' => $offer,
            'companies' => $companies,
        ]);
    }

    public function update(Request $request, $id)
    {
        $offer = Offer::where('id', $id)->where('offerer_id', Auth::id())->firstOrFail();

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'offerer_type' => 'required|in:referrer,referred',
            'company_id' => 'required|exists:companies,id',
            'reward_total_euros' => 'required|numeric|min:0',
            'reward_offerer_percent' => 'required|numeric|min:0|max:1',
        ]);

        $offer->update([
            'title' => $request->title,
            'description' => $request->description,
            'offerer_type' => $request->offerer_type,
            'company_id' => $request->company_id,
            'reward_total_cents' => $request->reward_total_euros * 100,
            'reward_offerer_percent' => $request->reward_offerer_percent,
        ]);

        return redirect()->route('web.my-offers.index');
    }
}