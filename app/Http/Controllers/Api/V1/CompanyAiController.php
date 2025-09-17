<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CompanyAiController extends Controller
{
    public function aiLookup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $companyName = $request->input('name');
        
        try {
            // Try to get company information using AI/web scraping
            $aiData = $this->fetchCompanyDataWithAI($companyName);
            
            return response()->json($aiData);
        } catch (\Exception $e) {
            Log::error('AI lookup failed: ' . $e->getMessage());
            return response()->json([
                'industry' => null,
                'website_url' => null,
                'error' => 'AI lookup failed'
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:companies,name',
                'referral_program_url' => 'nullable|url',
                'industry' => 'nullable|string|max:255',
                'website_url' => 'nullable|url',
                'description' => 'nullable|string',
                'logo_path' => 'nullable|string'
            ]);

            Log::info('Creating company with data:', $validated);

            $company = Company::create([
                'name' => $validated['name'],
                'referral_program_url' => $validated['referral_program_url'] ?? null,
                'industry' => $validated['industry'] ?? null,
                'website_url' => $validated['website_url'] ?? null,
                'description' => $validated['description'] ?? null,
                'logo_path' => $validated['logo_path'] ?? null,
                'admin_status' => 'pending'
            ]);

            Log::info('Company created successfully:', ['id' => $company->id]);
            return response()->json($company, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', $e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Company creation failed:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create company'], 500);
        }
    }

    private function fetchCompanyDataWithAI(string $companyName): array
    {
        // Option 1: Pappers.fr (French company database)
        return $this->fetchWithPappers($companyName);
    }

    private function fetchWithOpenAI(string $companyName): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful assistant that provides company information. Return only JSON with "industry" and "website_url" fields. If you cannot find the information, return null for those fields.'
                ],
                [
                    'role' => 'user',
                    'content' => "Find the industry and website URL for the company: {$companyName}"
                ]
            ],
            'max_tokens' => 150,
            'temperature' => 0.1
        ]);

        if ($response->successful()) {
            $content = $response->json()['choices'][0]['message']['content'] ?? '';
            $data = json_decode($content, true);
            
            return [
                'industry' => $data['industry'] ?? null,
                'website_url' => $data['website_url'] ?? null
            ];
        }

        return ['industry' => null, 'website_url' => null];
    }

    private function fetchWithPappers(string $companyName): array
    {
        $response = Http::get('https://api.pappers.fr/v2/recherche', [
            'api_token' => '12968a84ac1ccf9c5e93de516c7e7f3ea7cdaca4d60d1b4d',
            'q' => $companyName,
            'longueur' => 1
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $entreprises = $data['resultats'] ?? [];
            
            if (!empty($entreprises)) {
                $entreprise = $entreprises[0];
                return [
                    'industry' => $entreprise['libelle_activite_principale'] ?? null,
                    'website_url' => $entreprise['site_internet'] ?? null
                ];
            }
        }

        return ['industry' => null, 'website_url' => null];
    }

    private function fetchWithDomainLookup(string $companyName): array
    {
        $cleanName = strtolower(preg_replace('/[^a-z0-9]/', '', $companyName));
        $domains = [
            "https://www.{$cleanName}.com",
            "https://www.{$cleanName}.de",
            "https://{$cleanName}.com"
        ];

        foreach ($domains as $domain) {
            try {
                $response = Http::timeout(5)->head($domain);
                if ($response->successful()) {
                    return [
                        'website_url' => $domain,
                        'industry' => null
                    ];
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        return ['industry' => null, 'website_url' => null];
    }

    private function isCompanyWebsite(string $url, string $companyName): bool
    {
        $domain = parse_url($url, PHP_URL_HOST);
        $cleanCompany = strtolower(preg_replace('/[^a-z0-9]/', '', $companyName));
        $cleanDomain = strtolower(preg_replace('/[^a-z0-9]/', '', $domain));
        
        return str_contains($cleanDomain, $cleanCompany) || str_contains($cleanCompany, $cleanDomain);
    }

    private function extractIndustryFromSnippet(string $snippet): ?string
    {
        $industries = ['fintech', 'ecommerce', 'technology', 'finance', 'retail', 'healthcare', 'education'];
        
        foreach ($industries as $industry) {
            if (str_contains(strtolower($snippet), $industry)) {
                return ucfirst($industry);
            }
        }
        
        return null;
    }
}