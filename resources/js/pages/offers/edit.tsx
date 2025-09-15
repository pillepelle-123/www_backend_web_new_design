import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, Euro, Percent, UserRound, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meine Angebote',
        href: '/my-offers',
    },
    {
        title: 'Bearbeiten',
        href: '#',
    },
];

type Company = {
    id: number;
    name: string;
};

type Offer = {
    id: number;
    title: string;
    description: string;
    offerer_type: 'referrer' | 'referred';
    company_id: number;
    reward_total_cents: number;
    reward_offerer_percent: number;
};

export default function EditOffer({ offer, companies }: { offer: Offer; companies: Company[] }) {
    const { data, setData, processing, errors } = useForm({
        title: offer.title,
        description: offer.description || '',
        company_id: offer.company_id.toString(),
        reward_total_eur: offer.reward_total_cents / 100,
        reward_offerer_percent: offer.reward_offerer_percent * 100,
        offerer_type: offer.offerer_type,
    });

    const [selectedCompany, setSelectedCompany] = useState<{ value: string; label: string } | null>(
        companies.find(c => c.id === offer.company_id)
            ? { value: offer.company_id.toString(), label: companies.find(c => c.id === offer.company_id)!.name }
            : null
    );

    const companyOptions = companies.map(company => ({
        value: company.id.toString(),
        label: company.name
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/my-offers/${offer.id}`, {
            title: data.title,
            description: data.description,
            company_id: data.company_id,
            reward_total_euros: data.reward_total_eur,
            reward_offerer_percent: data.reward_offerer_percent / 100,
            offerer_type: data.offerer_type,
        }, {
            onSuccess: () => {
                router.visit('/my-offers', { preserveState: false });
            }
        });
    };

    const selectClassNames = {
        control: () => 'mt-1 rounded-md bg-[var(--md-surface-container)] border-[var(--md-outline-variant)] shadow-none min-h-[36px] text-[var(--md-on-surface)]',
        menu: () => 'rounded-md bg-[var(--md-surface-container)] mt-1 shadow-lg border border-[var(--md-outline-variant)]',
        option: ({ isFocused, isSelected }) =>
          `cursor-pointer px-4 py-2 text-[var(--md-on-surface)] ${isSelected ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]' : isFocused ? 'bg-[var(--md-surface-container-high)]' : ''}`,
        singleValue: () => '!text-[var(--md-on-surface)] ',
        input: () => 'text-[var(--md-on-surface)] ',
        placeholder: () => 'text-[var(--md-on-surface-variant)]',
    };

    return (
        <ModernLayout breadcrumbs={breadcrumbs}>
            <Head title="Angebot bearbeiten" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
                    Angebot bearbeiten
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
                        <label htmlFor="company" className="flex gap-1 md-label">
                            <Building2 className="w-4 h-4" />
                            Anbieter
                        </label>
                        <Select
                            id="company"
                            value={selectedCompany}
                            onChange={(option) => {
                                setSelectedCompany(option);
                                setData('company_id', option?.value || '');
                            }}
                            options={companyOptions}
                            classNames={selectClassNames}
                            classNamePrefix="select"
                            isClearable
                            required
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    color: '#000000 !important',
                                    backgroundColor: 'var(--md-surface-container)',
                                    //border: '1px solid orange !important',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        borderColor: 'var(--md-outline)',
                                    },
                                })
                            }}
                        />
                        {errors.company_id && (
                            <p className="mt-1 text-sm text-[var(--md-error)]">{errors.company_id}</p>
                        )}
                    </div>
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

                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => router.visit('/my-offers')}
                            className="md-button md-button--outlined"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="md-button md-button--filled"
                        >
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </form>
            </div>
        </ModernLayout>
    );
}
