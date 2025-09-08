import { Link } from '@inertiajs/react';
import { Offer } from '@/pages/offers/index';
import {
  UserRound,
  UsersRound,
  Building2,
  Star,
  StarHalf,
  CheckCircle,
  Euro,
  Calendar,
  TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface ModernOfferCardProps {
  offer: Offer;
}

export function ModernOfferCard({ offer }: ModernOfferCardProps) {
  const [showRatingTooltip, setShowRatingTooltip] = useState(false);
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);

  const getTooltipText = (type: string | undefined | null) => {
    if (type === 'Werbender') {
      return 'Hat einen Account und möchte dich werben.';
    } else if (type === 'Beworbener') {
      return 'Hat noch keinen Account und möchte von dir beworben werden.';
    }
    return '';
  };

  const formatCurrency = (cents: number | undefined | null) => {
    if (cents === undefined || cents === null) return '€0,00';
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const formatDateTime = (date: string | undefined | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', ' | ');
  };

  const truncateText = (text: string | undefined | null, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  function getStarIcons(averageRating: number) {
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

  const getStatusBadge = () => {
    if (offer.status === 'matched') {
      return (
        <div className="absolute -top-2 -left-2 z-10">
          <span className="md-badge md-badge--success">
            <CheckCircle className="w-3 h-3" />
            Matched
          </span>
        </div>
      );
    }
    return null;
  };

  const getApplicationBadge = () => {
    if (offer.has_application && offer.application_status !== 'retracted') {
      const statusMap = {
        'pending': { text: 'Anfrage gesendet', variant: 'md-badge--primary' },
        'approved': { text: 'Anfrage angenommen', variant: 'md-badge--success' },
        'rejected': { text: 'Anfrage abgelehnt', variant: 'md-badge--error' }
      };

      const status = statusMap[offer.application_status as keyof typeof statusMap];
      if (status) {
        return (
          <span className={`md-badge ${status.variant}`}>
            {status.text}
          </span>
        );
      }
    }
    return null;
  };

  return (
    <div className="md-card md-card--elevated relative overflow-hidden group">
      {getStatusBadge()}

      {/* Company Logo Background */}
      {offer.logo_path && (
        <div className="absolute right-0 top-0 w-32 h-32 pointer-events-none opacity-10">
          <img
            src={`/storage/${offer.logo_path}`}
            alt="Firmenlogo"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <div className="p-6 relative">
        {/* Header with Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--md-on-surface-variant)]">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(offer.created_at)}</span>
          </div>
          {getApplicationBadge()}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-[var(--md-on-surface)] mb-3 group-hover:text-[var(--md-primary)] transition-colors">
          {truncateText(offer.title, 60)}
        </h3>

        {/* Company and User Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[var(--md-on-surface-variant)] flex-shrink-0" />
            <span className="text-[var(--md-on-surface)] font-medium">
              {truncateText(offer.offer_company, 30)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <UserRound className="w-5 h-5 text-[var(--md-on-surface-variant)] flex-shrink-0" />
            <span className="text-[var(--md-on-surface)]">
              {offer.offer_user}
            </span>
            <Link
              href={route('web.ratings.user-index', { userId: offer.offerer_id })}
              className="flex items-center gap-1 text-sm text-[var(--md-on-surface-variant)] hover:text-[var(--md-primary)] transition-colors"
              onMouseEnter={e => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 4 });
                setShowRatingTooltip(true);
              }}
              onMouseLeave={() => setShowRatingTooltip(false)}
            >
              {getStarIcons(offer.average_rating ?? 0)}
              <span className="text-xs">({offer.average_rating?.toFixed(1) ?? '0.0'})</span>
            </Link>
          </div>
        </div>

        {/* Reward Section */}
        <div className="bg-[var(--md-surface-container)] rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-[var(--md-primary)]" />
              <div>
                <div className="text-sm text-[var(--md-on-surface-variant)]">Gesamte Prämie</div>
                <div className="text-lg font-semibold text-[var(--md-on-surface)]">
                  {formatCurrency(offer.reward_total_cents || 0)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-[var(--md-on-surface-variant)]">
                <TrendingUp className="w-4 h-4" />
                <span>Dein Anteil</span>
              </div>
              <div className="text-lg font-bold text-[var(--md-success)]">
                {formatCurrency((1 - (offer.reward_offerer_percent || 0)) * (offer.reward_total_cents || 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <Link
            href={`/offers/${offer.id || ''}`}
            className="md-button md-button--filled"
          >
            Details anzeigen
          </Link>

          {/* Offerer Type Badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 bg-[var(--md-surface-container-high)] rounded-lg text-sm text-[var(--md-on-surface)]"
            onMouseEnter={e => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setTooltipPos({ x: rect.left, y: rect.top });
              setShowTypeTooltip(true);
            }}
            onMouseLeave={() => setShowTypeTooltip(false)}
          >
            <UsersRound className="w-4 h-4" />
            <span>{offer.offerer_type}</span>
          </div>
        </div>
      </div>

      {/* Tooltips */}
      {showRatingTooltip && tooltipPos && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none transition-opacity duration-300 opacity-100"
          style={{ left: tooltipPos.x - 80, top: tooltipPos.y - 36 }}
        >
          <div className="bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)] text-xs rounded-lg p-2 shadow-lg border border-[var(--md-outline-variant)]">
            ⌀ Bewertung: {offer.average_rating?.toFixed(2) ?? '0.00'}
          </div>
        </div>,
        document.body
      )}

      {showTypeTooltip && tooltipPos && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none transition-opacity duration-300 opacity-100"
          style={{ left: tooltipPos.x - 110, top: tooltipPos.y }}
        >
          <div className="bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)] text-sm rounded-lg p-2 shadow-lg border border-[var(--md-outline-variant)] max-w-60">
            <strong>{offer.offerer_type}:</strong> {getTooltipText(offer.offerer_type)}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
