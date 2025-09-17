import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Building2, Euro, Percent, UserRound, UsersRound, FileText, Plus } from 'lucide-react';
import Fuse from 'fuse.js';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Offers',
        href: '/offers',
    },
    {
        title: 'Create Offer',
        href: '/offers/create',
    },
];

type Company = {
    id: number;
    name: string;
};

export default function Create({ companies: initialCompanies }: { companies: Company[] }) {
    const [companies, setCompanies] = useState<Company[]>(initialCompanies);
    const { data, setData, processing, errors } = useForm({
        title: '',
        description: '',
        company_id: '',
        reward_total_eur: 0,
        reward_offerer_percent: 0,
        offerer_type: 'referrer',
    });

    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companySearch, setCompanySearch] = useState('');
    const [showCompanyOverlay, setShowCompanyOverlay] = useState(false);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [tempSelectedCompany, setTempSelectedCompany] = useState<Company | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [showManualFields, setShowManualFields] = useState(false);
    const [readyToSave, setReadyToSave] = useState(false);
    const [newCompanyData, setNewCompanyData] = useState({ name: '', referral_program_url: '', industry: '', website_url: '' });
    const [wikimediaResults, setWikimediaResults] = useState([]);
    const [isSearchingWikimedia, setIsSearchingWikimedia] = useState(false);
    const [showWikimediaResults, setShowWikimediaResults] = useState(false);
    const [selectedWikimediaCompany, setSelectedWikimediaCompany] = useState(null);
    const [showWikimediaPreview, setShowWikimediaPreview] = useState(false);
    // const [isDark, setIsDark] = useState(false);

    { /*
    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);
    */ }

    const companyOptions = companies.map(company => ({
        value: company.id.toString(),
        label: company.name
    }));

    const fuse = useMemo(() => new Fuse(companies, {
        keys: ['name'],
        threshold: 0.3,
        distance: 100,
        minMatchCharLength: 1,
        includeScore: true
    }), [companies]);

    useEffect(() => {
        if (companySearch.length >= 1) {
            const results = fuse.search(companySearch);
            setFilteredCompanies(results.map(result => result.item));
        } else {
            setFilteredCompanies([]);
        }
        // Hide Wikimedia results when search string changes
        setShowWikimediaResults(false);
    }, [companySearch, fuse]);

    const searchWikimedia = async (companyName) => {
        setIsSearchingWikimedia(true);
        try {
            // Search Wikidata for entities
            const searchResponse = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(companyName)}&language=de&format=json&origin=*`);
            const searchData = await searchResponse.json();

            const companyEntities = [];

            // Check each result to see if it's a company
            for (const entity of searchData.search || []) {
                try {
                    const entityResponse = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entity.id}&format=json&origin=*`);
                    const entityData = await entityResponse.json();

                    const entityInfo = entityData.entities[entity.id];
                    const claims = entityInfo.claims || {};

                    // Check if entity has "instance of" (P31) property
                    if (claims.P31) {
                        const instanceOfValues = claims.P31.map(claim =>
                            claim.mainsnak?.datavalue?.value?.id
                        ).filter(Boolean);

                        // Check if it's a company type
                        const companyTypes = ['Q783794', 'Q6881511', 'Q891723', 'Q4830453'];
                        const isCompany = instanceOfValues.some(value => companyTypes.includes(value));

                        if (isCompany) {
                            // Get industry from P452 property
                            let industry = '';
                            if (claims.P452 && claims.P452[0]?.mainsnak?.datavalue?.value?.id) {
                                const industryId = claims.P452[0].mainsnak.datavalue.value.id;
                                try {
                                    const industryResponse = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${industryId}&format=json&origin=*`);
                                    const industryData = await industryResponse.json();
                                    industry = industryData.entities[industryId]?.labels?.de?.value || industryData.entities[industryId]?.labels?.en?.value || '';
                                } catch (e) {
                                    console.error('Error fetching industry:', e);
                                }
                            }

                            // Get website from P856 property
                            let website = '';
                            if (claims.P856 && claims.P856[0]?.mainsnak?.datavalue?.value) {
                                website = claims.P856[0].mainsnak.datavalue.value;
                            }

                            // Get logo from P154 property
                            let logoUrl = '';
                            if (claims.P154 && claims.P154[0]?.mainsnak?.datavalue?.value) {
                                const logoFilename = claims.P154[0].mainsnak.datavalue.value;
                                logoUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(logoFilename)}`;
                            }

                            // Get description
                            const description = entityInfo.descriptions?.de?.value || entityInfo.descriptions?.en?.value || '';

                            companyEntities.push({
                                id: entity.id,
                                label: entity.label,
                                industry: industry,
                                website: website,
                                logoUrl: logoUrl,
                                description: description,
                                url: entity.concepturi
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error checking entity:', error);
                }
            }

            setWikimediaResults(companyEntities);
            setShowWikimediaResults(true);
        } catch (error) {
            console.error('Wikimedia search failed:', error);
        } finally {
            setIsSearchingWikimedia(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/offers', {
            ...data,
            reward_total_cents: Math.round((data.reward_total_eur || 0) * 100),
            reward_offerer_percent: (data.reward_offerer_percent || 0) / 100,
            offerer_type: data.offerer_type,
        });
    };

    // const formatCurrency = (value: number) => {
    //     // const number = parseFloat(value);
    //     // if (isNaN(number)) return '';
    //     return (value / 100).toFixed(2);
    // };

    // const parseCurrency = (value: string) => {
    //     const number = parseFloat(value);
    //     if (isNaN(number)) return '';
    //     return Math.round(number * 100).toString();
    // };

    // const formatPercent = (value: number) => {
    //     // const number = parseFloat(value);
    //     if (isNaN(value)) return '';
    //     return (value * 100).toFixed(0);
    // };

    // const parsePercent = (value: string) => {
    //     const number = parseFloat(value);
    //     if (isNaN(number)) return '';
    //     return Math.round(number / 100).toString();
    // };

    // const selectClassNames = {
    //     control: (base) => ({
    //         ...base,
    //         'mt-1 bg-zinc-100 dark:bg-zinc-800'
    //     }),
    // };

    const selectClassNames = {
        control: () => 'mt-1 rounded-md bg-[var(--md-surface-container)] border-[var(--md-outline-variant)] shadow-none min-h-[36px]',
        menu: () => 'rounded-md bg-[var(--md-surface-container)] mt-1 shadow-lg border border-[var(--md-outline-variant)]',
        option: ({ isFocused, isSelected }) =>
          `cursor-pointer px-4 py-2 ${isSelected ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]' : isFocused ? 'bg-[var(--md-surface-container-high)]' : ''}`,
        singleValue: () => '!text-[var(--md-on-surface)]',
        input: () => 'text-[var(--md-on-surface)]',
        placeholder: () => 'text-[var(--md-on-surface-variant)]',
      };

    // const selectStyles = {
    //     control: (base) => ({
    //         ...base,
    //         backgroundColor: isDark ? 'rgb(39 39 42)' : 'rgb(243, 244, 246)', // '#fff', // dark:bg-zinc-800, light:bg-white
    //         border: 'none',
    //         borderColor: isDark ? 'rgb(63 63 70)' : '#d1d5db', // dark:border-zinc-700, light:border-gray-300
    //         color: isDark ? 'rgb(209 213 219)' : '#111827', // dark:text-gray-300, light:text-gray-900
    //         '&:hover': {
    //             borderColor: isDark ? 'rgb(82 82 91)' : '#a1a1aa', // dark:hover:border-zinc-600, light:hover:border-gray-400
    //         },
    //         boxShadow: 'none',
    //     }),
    //     menu: (base) => ({
    //         ...base,
    //         backgroundColor: isDark ? 'rgb(39 39 42)' : '#fff', // dark:bg-zinc-800, light:bg-white
    //         color: isDark ? 'rgb(209 213 219)' : '#111827',
    //     }),
    //     option: (base, state) => ({
    //         ...base,
    //         backgroundColor: state.isFocused
    //             ? (isDark ? 'oklch(0.588 0.158 241.966)' : '#f3f4f6') // dark:bg-zinc-700, light:bg-gray-100
    //             : (isDark ? 'oklch(0.2739 0.0055 286.03)' : '#fff'), // dark:bg-zinc-800, light:bg-white
    //         color: isDark ? 'oklch(0.9276 0.0058 264.53)' : '#111827', // dark:text-gray-300, light:text-gray-900
    //         '&:active': {
    //             backgroundColor: isDark ? 'rgb(82 82 91)' : '#e5e7eb', // dark:active:bg-zinc-600, light:active:bg-gray-200
    //         },
    //     }),
    //     singleValue: (base) => ({
    //         ...base,
    //         color: isDark ? 'rgb(209 213 219)' : '#111827', // dark:text-gray-300, light:text-gray-900
    //     }),
    //     input: (base) => ({
    //         ...base,
    //         color: isDark ? 'rgb(209 213 219)' : '#111827', // dark:text-gray-300, light:text-gray-900
    //     }),
    //     placeholder: (base) => ({
    //         ...base,
    //         color: isDark ? 'rgb(156 163 175)' : '#6b7280', // dark:text-gray-400, light:text-gray-500
    //     }),
    // };

    return (
        <ModernLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Offer" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
                    Neues Angebot erstellen
                </h1>
            </div>

            {/* Form */}
            <div className="md-card md-card--elevated p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="flex gap-1 md-label">
                                <UserRound className="w-4 h-4" />
                                Du bist...
                            </label>
                            <div className="space-y-2">
                                <div
                                    className={`relative flex cursor-pointer rounded-lg border bg-[var(--md-surface-container)] px-5 py-4 shadow-sm focus:outline-none transition-all duration-300 ${
                                        data.offerer_type === 'referrer'
                                            ? 'border-[var(--md-primary)] ring-2 ring-[var(--md-primary)]'
                                            : 'border-[var(--md-outline-variant)] hover:border-[var(--md-outline)]'
                                    }`}
                                    onClick={() => setData('offerer_type', 'referrer')}
                                    tabIndex={0}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setData('offerer_type', 'referrer') }}
                                    role="radio"
                                    aria-checked={data.offerer_type === 'referrer'}
                                >
                                    <span className="flex h-5 items-center">
                                        <span
                                            className={`inline-block h-4 w-4 rounded-full border-2 ${
                                                data.offerer_type === 'referrer'
                                                    ? 'border-[var(--md-primary)] bg-[var(--md-primary)]'
                                                    : 'border-[var(--md-outline-variant)] bg-[var(--md-surface)]'
                                            }`}
                                        />
                                    </span>
                                    <span className="ml-3 flex flex-col">
                                        <span className="block text-sm font-medium text-[var(--md-on-surface)]">
                                            Werbender
                                        </span>
                                        <span className="block text-xs text-[var(--md-on-surface-variant)]">
                                            Du hast einen Account und möchtest jemanden werben.
                                        </span>
                                    </span>
                                </div>
                                <div
                                    className={`relative flex cursor-pointer rounded-lg border bg-[var(--md-surface-container)] px-5 py-4 shadow-sm focus:outline-none transition-all duration-300 ${
                                        data.offerer_type === 'referred'
                                            ? 'border-[var(--md-primary)] ring-2 ring-[var(--md-primary)]'
                                            : 'border-[var(--md-outline-variant)] hover:border-[var(--md-outline)]'
                                    }`}
                                    onClick={() => setData('offerer_type', 'referred')}
                                    tabIndex={0}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setData('offerer_type', 'referred') }}
                                    role="radio"
                                    aria-checked={data.offerer_type === 'referred'}
                                >
                                    <span className="flex h-5 items-center">
                                        <span
                                            className={`inline-block h-4 w-4 rounded-full border-2 ${
                                                data.offerer_type === 'referred'
                                                    ? 'border-[var(--md-primary)] bg-[var(--md-primary)]'
                                                    : 'border-[var(--md-outline-variant)] bg-[var(--md-surface)]'
                                            }`}
                                        />
                                    </span>
                                    <span className="ml-3 flex flex-col">
                                        <span className="block text-sm font-medium text-[var(--md-on-surface)]">
                                            Beworbener
                                        </span>
                                        <span className="block text-xs text-[var(--md-on-surface-variant)]">
                                            Du hast noch keinen Account und möchtest von jemandem beworben werden.
                                        </span>
                                    </span>
                                </div>
                            </div>
                            {errors.offerer_type && (
                                <p className="mt-1 text-sm text-[var(--md-error)]">{errors.offerer_type}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="title" className="flex gap-1 md-label">
                                <FileText className="w-4 h-4" />
                                Titel
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="md-input"
                                required
                                placeholder="Unter welchem Titel soll dein Angebot angezeigt werden?"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-[var(--md-error)]">{errors.title}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="description" className="flex gap-1 md-label">
                                <FileText className="w-4 h-4" />
                                Beschreibung
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={4}
                                className="md-input"
                                required
                                placeholder="Beschreibe dein Angebot"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-[var(--md-error)]">{errors.description}</p>
                            )}
                        </div>
                        <div>
                            <label className="flex gap-1 md-label">
                                <Building2 className="w-4 h-4" />
                                Anbieter
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCompanyOverlay(true);
                                    setCompanySearch('');
                                    setTempSelectedCompany(null);
                                }}
                                className="md-input text-left flex items-center justify-between hover:border-[var(--md-outline)] transition-colors"
                            >
                                <span className={selectedCompany ? 'text-[var(--md-on-surface)]' : 'text-[var(--md-on-surface-variant)]'}>
                                    {selectedCompany ? selectedCompany.name : 'Auswählen'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-[var(--md-on-surface-variant)]" />
                            </button>
                            {errors.company_id && (
                                <p className="mt-1 text-sm text-[var(--md-error)]">{errors.company_id}</p>
                            )}
                        </div>

                        {/* Company Selection Overlay */}
                        {showCompanyOverlay && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="bg-[var(--md-surface)] rounded-lg shadow-xl w-full max-w-md mx-4 h-[80vh] flex flex-col">
                                    <div className="p-6 border-b border-[var(--md-outline-variant)]">
                                        <h3 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4">Unternehmen auswählen</h3>
                                        <input
                                            type="text"
                                            value={companySearch}
                                            onChange={(e) => setCompanySearch(e.target.value)}
                                            className="md-input"
                                            placeholder="Geben sie den Namen des Unternehmens ein..."
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        {showWikimediaPreview ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-[var(--md-on-surface)]">Wikimedia Unternehmen</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowWikimediaPreview(false);
                                                            setSelectedWikimediaCompany(null);
                                                            setShowWikimediaResults(true);
                                                        }}
                                                        className="text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                {selectedWikimediaCompany && (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Name</label>
                                                            <div className="md-text text-[var(--md-on-surface)]">{selectedWikimediaCompany.label}</div>
                                                        </div>
                                                        {selectedWikimediaCompany.website && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Website</label>
                                                                <div className="md-text text-[var(--md-on-surface)]">{selectedWikimediaCompany.website}</div>
                                                            </div>
                                                        )}
                                                        {selectedWikimediaCompany.industry && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Branche</label>
                                                                <div className="md-text text-[var(--md-on-surface)]">{selectedWikimediaCompany.industry}</div>
                                                            </div>
                                                        )}
                                                        {selectedWikimediaCompany.description && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Beschreibung</label>
                                                                <div className="md-text text-[var(--md-on-surface)] min-h-[40px]">{selectedWikimediaCompany.description}</div>
                                                            </div>
                                                        )}
                                                        {selectedWikimediaCompany.logoUrl && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Logo</label>
                                                                <img src={selectedWikimediaCompany.logoUrl} alt="Company Logo" className="max-w-32 max-h-32 object-contain border border-[var(--md-outline-variant)] rounded" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : showCreateForm ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-[var(--md-on-surface)]">Neues Unternehmen</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowCreateForm(false);
                                                            setShowManualFields(false);
                                                            setReadyToSave(false);
                                                            setNewCompanyData({ name: '', referral_program_url: '', industry: '', website_url: '' });
                                                        }}
                                                        className="text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Name *</label>
                                                    <input
                                                        type="text"
                                                        value={newCompanyData.name}
                                                        onChange={(e) => setNewCompanyData(prev => ({ ...prev, name: e.target.value }))}
                                                        className="md-input"
                                                        placeholder="Unternehmensname"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Referral Program URL</label>
                                                    <input
                                                        type="url"
                                                        value={newCompanyData.referral_program_url}
                                                        onChange={(e) => setNewCompanyData(prev => ({ ...prev, referral_program_url: e.target.value }))}
                                                        className="md-input"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                {isCreatingCompany && !readyToSave && (
                                                    <div className="bg-[var(--md-surface-container)] p-4 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="md-spinner w-5 h-5"></div>
                                                            <span className="text-sm text-[var(--md-on-surface)]">KI-Agent sucht nach Unternehmensinformationen...</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {isCreatingCompany && readyToSave && (
                                                    <div className="bg-[var(--md-surface-container)] p-4 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="md-spinner w-5 h-5"></div>
                                                            <span className="text-sm text-[var(--md-on-surface)]">Unternehmen wird gespeichert...</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {showManualFields && (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Branche</label>
                                                            <input
                                                                type="text"
                                                                value={newCompanyData.industry}
                                                                onChange={(e) => setNewCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                                                                className="md-input"
                                                                placeholder="z.B. Fintech, E-Commerce"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-[var(--md-on-surface)] mb-1">Website URL</label>
                                                            <input
                                                                type="url"
                                                                value={newCompanyData.website_url}
                                                                onChange={(e) => setNewCompanyData(prev => ({ ...prev, website_url: e.target.value }))}
                                                                className="md-input"
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : companySearch.length < 1 ? (
                                            <div className="text-center text-[var(--md-on-surface-variant)] py-2">
                                                ...
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {/* Add new company option */}
                                                <div
                                                    className="px-4 py-3 rounded-lg cursor-pointer transition-colors bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] hover:bg-[var(--md-primary-container)]/80 flex items-center gap-2"
                                                    onClick={() => searchWikimedia(companySearch)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>"{companySearch}" hinzufügen</span>
                                                </div>

                                                {/* Wikimedia search results */}
                                                {isSearchingWikimedia && (
                                                    <div className="bg-[var(--md-surface-container)] p-4 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="md-spinner w-5 h-5"></div>
                                                            <span className="text-sm text-[var(--md-on-surface)]">Suche in Wikimedia...</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {showWikimediaResults && wikimediaResults.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-medium text-[var(--md-on-surface)] px-2">Wikimedia Ergebnisse:</div>
                                                        {wikimediaResults.map((result) => (
                                                            <div
                                                                key={result.id}
                                                                className="px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-surface)] text-[var(--md-on-surface)] border border-[var(--md-outline-variant)] group"
                                                                onClick={() => {
                                                                    setSelectedWikimediaCompany(result);
                                                                    setShowWikimediaPreview(true);
                                                                    setShowWikimediaResults(false);
                                                                }}
                                                            >
                                                                <div className="font-medium">{result.label}</div>
                                                                {result.industry && (
                                                                    <div className="text-sm text-[var(--md-on-surface-variant)] group-hover:text-[var(--md-surface)] mt-1">{result.industry}</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {showWikimediaResults && wikimediaResults.length === 0 && !isSearchingWikimedia && (
                                                    <div className="bg-[var(--md-surface-container)] p-4 rounded-lg text-center">
                                                        <span className="text-sm text-[var(--md-on-surface-variant)]">Keine Unternehmen in Wikimedia gefunden</span>
                                                        <div
                                                            className="mt-2 text-sm text-[var(--md-primary)] cursor-pointer hover:underline"
                                                            onClick={() => {
                                                                setShowCreateForm(true);
                                                                setNewCompanyData(prev => ({ ...prev, name: companySearch }));
                                                                setShowWikimediaResults(false);
                                                            }}
                                                        >
                                                            Trotzdem "{companySearch}" manuell hinzufügen
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Existing companies */}
                                                {filteredCompanies.length > 0 ? (
                                                    filteredCompanies.map((company) => (
                                                        <div
                                                            key={company.id}
                                                            className={`px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                                                                tempSelectedCompany?.id === company.id
                                                                    ? 'bg-[var(--md-surface-container-high)] text-[var(--md-surface)]'
                                                                    : 'hover:bg-[var(--md-surface-container-high)] text-[var(--md-surface)]'
                                                            }`}
                                                            onClick={() => {
                                                                setTempSelectedCompany(company);
                                                                setCompanySearch(company.name);
                                                            }}
                                                        >
                                                            {company.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-[var(--md-on-surface-variant)] py-4">
                                                        Keine bestehenden Unternehmen gefunden
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 border-t border-[var(--md-outline-variant)] flex gap-4 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCompanyOverlay(false);
                                                setShowCreateForm(false);
                                                setShowManualFields(false);
                                                setReadyToSave(false);
                                                setNewCompanyData({ name: '', referral_program_url: '', industry: '', website_url: '' });
                                            }}
                                            className="md-button md-button--outlined"
                                        >
                                            Abbrechen
                                        </button>
                                        {showWikimediaPreview ? (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!selectedWikimediaCompany) return;

                                                    try {
                                                        const createResponse = await fetch('/companies', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                                            },
                                                            body: JSON.stringify({
                                                                name: selectedWikimediaCompany.label,
                                                                website_url: selectedWikimediaCompany.website || '',
                                                                industry: selectedWikimediaCompany.industry || '',
                                                                description: selectedWikimediaCompany.description || '',
                                                                logo_path: selectedWikimediaCompany.logoUrl || ''
                                                            })
                                                        });

                                                        if (createResponse.ok) {
                                                            const newCompany = await createResponse.json();
                                                            setCompanies(prev => [...prev, newCompany]);
                                                            setTempSelectedCompany(newCompany);
                                                            setCompanySearch(newCompany.name);
                                                            setShowWikimediaPreview(false);
                                                            setSelectedWikimediaCompany(null);
                                                        } else {
                                                            console.error('Failed to create company from Wikimedia data');
                                                        }
                                                    } catch (error) {
                                                        console.error('Error creating company:', error);
                                                    }
                                                }}
                                                className="md-button md-button--filled"
                                            >
                                                Speichern
                                            </button>
                                        ) : showCreateForm ? (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!newCompanyData.name.trim()) return;

                                                    setIsCreatingCompany(true);

                                                    try {
                                                        if (!readyToSave) {
                                                            // First click - fetch from API
                                                            const response = await fetch('/companies/ai-lookup', {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                                                },
                                                                body: JSON.stringify({ name: newCompanyData.name })
                                                            });

                                                            if (response.ok) {
                                                                const aiData = await response.json();
                                                                setNewCompanyData(prev => ({
                                                                    ...prev,
                                                                    industry: aiData.industry || '',
                                                                    website_url: aiData.website_url || ''
                                                                }));
                                                            }

                                                            setShowManualFields(true);
                                                            setReadyToSave(true);
                                                            setIsCreatingCompany(false);
                                                            return;
                                                        }

                                                        // Second click - save company to database
                                                        const createResponse = await fetch('/companies', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                                            },
                                                            body: JSON.stringify(newCompanyData)
                                                        });

                                                        if (createResponse.ok) {
                                                            const newCompany = await createResponse.json();
                                                            setTempSelectedCompany(newCompany);
                                                            setCompanySearch(newCompany.name);
                                                            setShowCreateForm(false);
                                                            setShowManualFields(false);
                                                            setReadyToSave(false);
                                                            setNewCompanyData({ name: '', referral_program_url: '', industry: '', website_url: '' });
                                                        } else {
                                                            const errorData = await createResponse.json().catch(() => createResponse.text());
                                                            console.error('Failed to create company:', {
                                                                status: createResponse.status,
                                                                error: errorData,
                                                                data: newCompanyData
                                                            });
                                                            alert('Fehler beim Speichern: ' + (errorData.error || 'Unbekannter Fehler'));
                                                        }
                                                    } catch (error) {
                                                        console.error('Error creating company:', error);
                                                    } finally {
                                                        setIsCreatingCompany(false);
                                                    }
                                                }}
                                                disabled={!newCompanyData.name.trim() || isCreatingCompany}
                                                className="md-button md-button--filled disabled:opacity-50"
                                            >
                                                {isCreatingCompany ? (readyToSave ? 'Speichern...' : 'Suchen...') : 'Speichern'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (tempSelectedCompany) {
                                                        setSelectedCompany(tempSelectedCompany);
                                                        setData('company_id', tempSelectedCompany.id.toString());
                                                    }
                                                    setShowCompanyOverlay(false);
                                                }}
                                                disabled={!tempSelectedCompany}
                                                className="md-button md-button--filled disabled:opacity-50"
                                            >
                                                Ok
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="reward_total_eur" className="flex gap-1 md-label">
                                <Euro className="w-4 h-4" />
                                Gesamte Prämie
                            </label>
                            <div className="relative mt-1 flex rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 border-r border-[var(--md-outline-variant)] pr-2 w-14">
                                    <span className="text-[var(--md-on-surface-variant)] sm:text-sm">EUR</span>
                                </div>
                                <input
                                    type="number"
                                    id="reward_total_eur"
                                    min="0"
                                    max="100000"
                                    step="0.01"
                                    value={data.reward_total_eur}
                                    onChange={e => setData('reward_total_eur', parseFloat(e.target.value) || 0)}
                                    className="md-input pl-16 pr-10"
                                    required
                                    placeholder="0.00"
                                />
                                <div className="absolute right-1 top-1 flex flex-col h-7 justify-center">
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="bg-[var(--md-surface-container)] text-[var(--md-on-surface)] rounded-t w-7 h-3 flex items-center justify-center hover:bg-[var(--md-surface-container-high)]"
                                        onMouseDown={e => { e.preventDefault(); setData('reward_total_eur', Math.round((data.reward_total_eur + 1) * 100) / 100); }}
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="bg-[var(--md-surface-container)] text-[var(--md-on-surface)] rounded-b w-7 h-3 flex items-center justify-center hover:bg-[var(--md-surface-container-high)]"
                                        onMouseDown={e => { e.preventDefault(); setData('reward_total_eur', Math.max(0, Math.round((data.reward_total_eur - 1) * 100) / 100)); }}
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            {errors.reward_total_eur && (
                                <p className="mt-1 text-sm text-[var(--md-error)]">{errors.reward_total_eur}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="reward_offerer_percent" className="flex gap-1 md-label">
                                <Percent className="w-4 h-4" />
                                Dein einbehaltener Anteil
                            </label>
                            <div className="relative mt-1 flex rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 border-r border-[var(--md-outline-variant)] pr-2 w-14">
                                    <span className="text-[var(--md-on-surface-variant)] sm:text-sm">%</span>
                                </div>
                                <input
                                    type="number"
                                    id="reward_offerer_percent"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={data.reward_offerer_percent}
                                    onChange={e => setData('reward_offerer_percent', parseInt(e.target.value) || 0)}
                                    className="md-input pl-16 pr-10"
                                    required
                                    placeholder="z.B. 20"
                                />
                                <div className="absolute right-1 top-1 flex flex-col h-7 justify-center">
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="bg-[var(--md-surface-container)] text-[var(--md-on-surface)] rounded-t w-7 h-3 flex items-center justify-center hover:bg-[var(--md-surface-container-high)]"
                                        onMouseDown={e => { e.preventDefault(); setData('reward_offerer_percent', Math.min(100, data.reward_offerer_percent + 1)); }}
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="bg-[var(--md-surface-container)] text-[var(--md-on-surface)] rounded-b w-7 h-3 flex items-center justify-center hover:bg-[var(--md-surface-container-high)]"
                                        onMouseDown={e => { e.preventDefault(); setData('reward_offerer_percent', Math.max(0, data.reward_offerer_percent - 1)); }}
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            {errors.reward_offerer_percent && (
                                <p className="mt-1 text-sm text-[var(--md-error)]">{errors.reward_offerer_percent}</p>
                            )}
                        </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="md-button md-button--filled"
                        >
                            {processing ? 'Creating...' : 'Create Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </ModernLayout>
    );
}
