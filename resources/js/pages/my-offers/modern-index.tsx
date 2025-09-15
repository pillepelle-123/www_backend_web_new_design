import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Archive,
  RotateCcw,
  Edit,
  Play,
  Target,
  Euro,
  Building2,
  UserRound,
  Inbox,
  Archive as ArchiveIcon
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meine Angebote',
        href: '/my-offers',
    },
];

type Offer = {
  id: number;
  title: string;
  company_name: string;
  offerer_type: 'referrer' | 'referred';
  offerer_type_label: string;
  status: 'draft' | 'live' | 'hidden' | 'matched' | 'deleted';
  status_label: string;
  reward_total_cents: number;
  reward_offerer_percent: number;
  created_at: string;
  is_archived: boolean;
};

export default function ModernMyOffersIndex({ offers }: { offers: Offer[] }) {
  const [activeTab, setActiveTab] = useState<'offers' | 'archive'>('offers');

  const filteredOffers = offers.filter(offer => {
    if (activeTab === 'offers' && offer.is_archived) return false;
    if (activeTab === 'archive' && !offer.is_archived) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string, statusLabel: string) => {
    const statusColors = {
      draft: 'md-badge--primary',
      live: 'md-badge--success',
      hidden: 'md-badge--warning',
      matched: 'md-badge--info',
      deleted: 'md-badge--error'
    };

    return (
      <span className={`md-badge ${statusColors[status as keyof typeof statusColors] || 'md-badge--primary'}`}>
        {statusLabel}
      </span>
    );
  };

  const updateOfferStatus = (offerId: number, newStatus: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/my-offers/${offerId}/status`;

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = '_token';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }

    const statusInput = document.createElement('input');
    statusInput.type = 'hidden';
    statusInput.name = 'status';
    statusInput.value = newStatus;
    form.appendChild(statusInput);

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <ModernLayout breadcrumbs={breadcrumbs}>
      <Head title="Meine Angebote" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
            Meine Angebote
          </h1>
          <div className="text-sm text-[var(--md-on-surface-variant)]">
            {filteredOffers.length} {activeTab === 'offers' ? 'aktive' : 'archivierte'} Angebote
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--md-outline-variant)]">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'offers'
                ? 'border-b-2 border-[var(--md-primary)] text-[var(--md-primary)]'
                : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Meine Angebote
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'archive'
                ? 'border-b-2 border-[var(--md-primary)] text-[var(--md-primary)]'
                : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <ArchiveIcon className="w-4 h-4" />
            Archiv
          </button>
        </div>
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <div className="md-empty-state">
          <Target className="md-empty-state-icon" />
          <h3 className="md-empty-state-title">
            {activeTab === 'offers' ? 'Keine Angebote gefunden' : 'Keine archivierten Angebote gefunden'}
          </h3>
          <p className="md-empty-state-description">
            {activeTab === 'offers'
              ? 'Sie haben noch keine Angebote erstellt. Erstellen Sie Ihr erstes Angebot.'
              : 'Es wurden keine archivierten Angebote gefunden.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="md-card md-card--elevated p-6 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-[var(--md-primary-container)] rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-[var(--md-on-primary-container)]" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      href={`/offers/${offer.id}`}
                      className="font-semibold text-[var(--md-on-surface)] truncate hover:text-[var(--md-primary)] transition-colors"
                    >
                      {offer.title}
                    </Link>
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusBadge(offer.status, offer.status_label)}
                      <span className="text-sm text-[var(--md-on-surface-variant)]">
                        {formatDate(offer.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm text-[var(--md-on-surface-variant)] mb-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{offer.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          <span className="font-medium text-[var(--md-on-surface)]">
                            {formatCurrency(offer.reward_total_cents)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[var(--md-on-surface-variant)]">
                        Sie sind: {offer.offerer_type_label}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Buttons für aktive Angebote */}
                      {activeTab === 'offers' && (
                        <>
                          {/* Veröffentlichen Button */}
                          {(offer.status === 'draft' || offer.status === 'hidden') && (
                            <button
                              onClick={() => updateOfferStatus(offer.id, 'live')}
                              className="md-button md-button--filled text-xs p-2"
                              title="Veröffentlichen"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          {/* Verstecken Button */}
                          {(offer.status === 'live' || offer.status === 'matched') && (
                            <button
                              onClick={() => updateOfferStatus(offer.id, 'hidden')}
                              className="md-button md-button--outlined text-xs p-2"
                              title="Verstecken"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}

                          {/* Bearbeiten Button */}
                          {(offer.status === 'draft' || offer.status === 'live' || offer.status === 'hidden' || offer.status === 'matched') && (
                            <Link
                              href={`/my-offers/${offer.id}/edit`}
                              className="md-button md-button--outlined text-xs p-2"
                              title="Bearbeiten"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Archivieren Button */}
                          {(offer.status === 'draft' || offer.status === 'hidden' || offer.status === 'live' || offer.status === 'matched') && (
                            <button
                              onClick={() => updateOfferStatus(offer.id, 'deleted')}
                              className="md-button md-button--outlined text-xs p-2"
                              title="Archivieren"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {/* Buttons für archivierte Angebote */}
                      {activeTab === 'archive' && (
                        <button
                          onClick={() => updateOfferStatus(offer.id, 'draft')}
                          className="md-button md-button--filled text-xs p-2"
                          title="Wiederherstellen"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModernLayout>
  );
}