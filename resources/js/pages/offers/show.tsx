import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Offer } from './index';
import { useState } from 'react';
import { Building2, Star, StarHalf, UserRound, UsersRound, CheckCircle, Euro } from 'lucide-react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { createPortal } from 'react-dom';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Offers',
        href: '/offers',
    },
    {
        title: 'Details',
        href: '#',
    },
];

export default function Show({ offer, returnUrl }: { offer: Offer, returnUrl?: string }) {
  // Use returnUrl from props, fallback to empty string
  const finalReturnUrl = returnUrl || '';
  // Tooltips
  const [showRatingTooltip, setShowRatingTooltip] = useState(false);
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);

  const getTooltipText = (type: string) => {
    if (type === 'Werbender') {
      return 'Hat einen Account und möchte dich werben.';
    } else if (type === 'Beworbener') {
      return 'Hat noch keinen Account und möchte von dir beworben werden.';
    }
  };

  // Formatting
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', ' | ');
  };

  // Star Icons
  function getStarIcons(averageRating: number) {
    // Auf halbe Sterne runden
    const rounded = Math.round(averageRating * 2) / 2;
    const fullStars = Math.floor(rounded);
    const hasHalf = rounded % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-500 stroke-yellow-500" />);
    }
    if (hasHalf) {
      stars.push(
        <span key="half" className="relative inline-block w-4 h-4">
          <Star className="w-4 h-4 fill-none stroke-yellow-500 absolute left-0 top-0" />
          <StarHalf className="w-4 h-4 fill-yellow-500 stroke-yellow-500 absolute left-0 top-0" />
        </span>
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={fullStars + (hasHalf ? 1 : 0) + i} className="w-4 h-4 fill-none stroke-yellow-500" />);
    }
    return stars;
  }

  return (
    <ModernLayout breadcrumbs={breadcrumbs}>
      <Head title={`Offer: ${offer.title}`} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
            {offer.title}
          </h1>
          {offer.status === 'matched' && (
            <div className="md-badge md-badge--primary">
              Gematcht
            </div>
          )}
        </div>
      </div>

      {/* Erstellungsdatum */}
      <div className="text-xs mb-4 text-[var(--md-on-surface-variant)]">
        {offer.created_at && formatDateTime(offer.created_at)}
      </div>

      {/* Company, User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex items-center gap-2 text-[var(--md-on-surface-variant)]">
          <Building2 className="w-5 h-5" />
          <span>{offer.offer_company}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--md-on-surface-variant)]">
          <UserRound className="w-5 h-5" />
          <span>{offer.offer_user}</span>
          <span className="text-xs flex items-center gap-0.5 relative"
            onMouseEnter={e => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 4 });
              setShowRatingTooltip(true);
            }}
            onMouseLeave={() => setShowRatingTooltip(false)}
          >
            {getStarIcons(offer.average_rating ?? 0)}
            {showRatingTooltip && tooltipPos && createPortal(
              <span
                className="fixed z-[9999] pointer-events-none transition-opacity duration-300 opacity-100 w-44 text-center"
                style={{ left: tooltipPos.x - 80, top: tooltipPos.y - 36 }}
              >
                <span className="block w-fit bg-neutral-800/90 text-white text-xs rounded-lg p-2 shadow-lg">
                  ⌀ Bewertung: {offer.average_rating?.toFixed(2) ?? '0.00'}
                </span>
              </span>,
              document.body
            )}
          </span>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Beschreibung */}
        {offer.description && (
          <div className="md-card md-card--elevated p-6">
            <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Beschreibung
            </h2>
            <p className="text-[var(--md-on-surface)]">{offer.description}</p>
          </div>
        )}

        {/* Reward */}
        <div className="md-card md-card--elevated p-6">
          <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Prämien
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-4 bg-[var(--md-surface-container)] rounded-lg">
              <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Gesamte Prämie</p>
              <p className="text-2xl font-bold text-[var(--md-on-surface)]">{formatCurrency(offer.reward_total_cents / 100)}</p>
            </div>
            <div className="text-center p-4 bg-[var(--md-surface-container)] rounded-lg">
              <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Anteil für dich</p>
              <p className="text-2xl font-bold text-[var(--md-success)]">
                {formatCurrency((1-offer.reward_offerer_percent) * offer.reward_total_cents / 100)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Link
          href={`/offers${finalReturnUrl}`}
          className="md-button md-button--outlined"
        >
          Zurück zur Übersicht
        </Link>

        {/* Zeige den Anfragen-Button, wenn der Benutzer keine aktive Anfrage hat oder die Anfrage zurückgezogen wurde */}
        {(!offer.has_application || offer.application_status === 'retracted') && !offer.is_offerer && offer.status !== 'matched' && (
          <Link
            href={route('web.applications.create', { offer_id: offer.id })}
            className="md-button md-button--filled"
          >
            Anfragen
          </Link>
        )}

        {offer.is_offerer && (
          <span className="text-[var(--md-on-surface-variant)]">Dies ist ihr Angebot</span>
        )}

        {/* Zeige einen Hinweis für gematchte Angebote */}
        {offer.status === 'matched' && (
          <p className="text-sm text-[var(--md-primary)]">
            Dieses Angebot wurde bereits erfolgreich gematcht.
            {offer.has_application && offer.application_status === 'approved' && " Sie sind Teil dieses Matches!"}
          </p>
        )}

        {/* Deaktivierter Button für gematchte Angebote */}
        {offer.status === 'matched' && !offer.is_offerer && !offer.has_application && (
          <button
            disabled
            className="md-button md-button--filled opacity-50 cursor-not-allowed"
          >
            Anfragen
          </button>
        )}

        {/* Zeige den Zurückziehen-Button, wenn der Benutzer eine Anfrage gestellt hat */}
        {offer.has_application && offer.application_status === 'pending' && (
          <form action={route('web.applications.retract', { id: offer.application_id })} method="POST">
            <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
            <button
              type="submit"
              className="md-button md-button--outlined text-[var(--md-error)] border-[var(--md-error)] hover:bg-[var(--md-error-container)]"
            >
              Anfrage zurückziehen
            </button>
          </form>
        )}

        {/* Zeige einen Hinweis, wenn der Benutzer eine aktive Anfrage gestellt hat */}
        {offer.has_application && offer.application_status !== 'retracted' && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-[var(--md-on-surface-variant)]">
              {offer.application_status === 'pending' && 'Sie haben eine Anfrage für dieses Angebot gestellt. Status: Ausstehend'}
              {offer.application_status === 'approved' && 'Ihre Anfrage wurde angenommen!'}
              {offer.application_status === 'rejected' && 'Ihre Anfrage wurde abgelehnt.'}
            </div>
            <Link
              href={route('web.applications.show', { id: offer.application_id })}
              className="text-sm text-[var(--md-primary)] hover:underline"
            >
              Zur Anfrage
            </Link>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
