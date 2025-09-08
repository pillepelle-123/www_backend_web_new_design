import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Offer } from './index';
import { useState } from 'react';
import { Building2, Star, StarHalf, UserRound, UsersRound, CheckCircle } from 'lucide-react';
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

export default function Show({ offer }: { offer: Offer }) {
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

      <div className="space-y-6">
        {/* Offer Details */}
        <div className="max-w-4xl mx-auto">
            <div className={`bg-white dark:bg-white/10 rounded-xl shadow-lg overflow-hidden relative ${offer.status === 'matched' ? 'opacity-75' : ''}`}>
              {offer.status === 'matched' && (
                <>
                  {/* <div className="absolute inset-0 z-0">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                  </div> */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <CheckCircle className="w-4 h-4" /> Matched
                    </span>
                  </div>
                </>
              )}
              {offer.logo_path && (
                <div className="absolute right-0 top-0 w-[50%] pointer-events-none">
                  <div className="relative w-full h-full">
                    <img
                      src={`/storage/${offer.logo_path}`}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-radial-[at_90%_10%] from-transparent dark:from-transparent via-white dark:via-[#535258] via-69% to-white dark:to-[#535258]" />
                  </div>
                </div>
              )}
              <div className="p-6 relative">
                {/* Erstellungsdatum */}
                <div className="w-[75%] items-start text-xs mb-4">
                  {offer.created_at && formatDateTime(offer.created_at)}
                </div>

                {/* Titel */}
                <div className="flex justify-between w-[75%] items-start min-h-26">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {offer.title}
                  </h1>
                </div>

                {/* Company, User, Description */}
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2 items-start text-gray-600 dark:text-gray-300 group w-full text-sm">
                    <div className="flex flex-none items-start basis-0 grow">
                      <Building2 className="flex-none w-5 h-5 mr-1" />
                      <div className="flex flex-col items-left grow">
                        <span className="relative block w-full">
                          {offer.offer_company}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start basis-0 grow">
                      <UserRound className="flex-none w-5 h-5 mr-1" />
                      <div className="flex flex-col items-left grow">
                        {/* Username */}
                        <span className="ml-2">{offer.offer_user}</span>

                        {/* Rating */}
                        <span className="ml-2 text-xs text-gray-500 flex flex-row items-center gap-0.5 relative"
                          onMouseEnter={e => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 4 });
                            setShowRatingTooltip(true);
                          }}
                          onMouseLeave={() => setShowRatingTooltip(false)}
                        >
                          {/* Star Icons */}
                          {getStarIcons(offer.average_rating ?? 0)}
                          {showRatingTooltip && tooltipPos && createPortal(
                            <span
                              className="fixed z-[9999] pointer-events-none transition-opacity duration-300 opacity-100 w-44 text-center"
                              style={{ left: tooltipPos.x - 80, top: tooltipPos.y - 36 }}
                            >
                              {/* Tooltip */}
                              <span className="block w-fit bg-neutral-800/90 text-white text-xs rounded-lg p-2 shadow-lg">
                                ⌀ Bewertung: {offer.average_rating?.toFixed(2) ?? '0.00'}
                              </span>
                            </span>,
                            document.body
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Beschreibung */}
                  {offer.description && (
                    <div className="text-gray-600 dark:text-gray-300">
                      <p className="text-base">{offer.description}</p>
                    </div>
                  )}

                  {/* Reward */}
                  <div className="flex gap-2 items-start justify-between pt-4 min-h-14 w-full">
                    <div className="flex flex-col grow text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Gesamte Prämie:<br/></span>
                      <span className="ml-2 text-xl">{formatCurrency(offer.reward_total_cents / 100)}</span>
                    </div>
                    <div className="flex flex-col grow text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Anteil für dich:<br/></span>
                      <span className="ml-2 text-xl text-green-500 font-bold">
                        {formatCurrency((1-offer.reward_offerer_percent) * offer.reward_total_cents / 100)}
                      </span>
                    </div>
                  </div>

                  {/* Aktions-Buttons */}
                  <div className="flex justify-between items-center pt-4">
                    <Link
                      href="/offers"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Zurück zur Übersicht
                    </Link>

                    {/* Zeige den Anfragen-Button, wenn der Benutzer keine aktive Anfrage hat oder die Anfrage zurückgezogen wurde */}
                    {(!offer.has_application || offer.application_status === 'retracted') && !offer.is_offerer && offer.status !== 'matched' && (
                      <Link
                        href={route('web.applications.create', { offer_id: offer.id })}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Anfragen
                      </Link>
                    )}

                    {(offer.is_offerer &&
                        <span>Dies ist ihre Offer</span>
                    )}

                    {/* Zeige einen Hinweis für gematchte Angebote */}
                    {offer.status === 'matched' && (
                    //   <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          Dieses Angebot wurde bereits erfolgreich gematcht.
                          {offer.has_application && offer.application_status === 'approved' && " Sie sind Teil dieses Matches!"}
                        </p>
                    //   </div>
                    )}

                    {/* Deaktivierter Button für gematchte Angebote */}
                    {offer.status === 'matched' && !offer.is_offerer && !offer.has_application && (
                      <button
                        disabled
                        className="inline-flex items-center px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-70"
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
                          className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                          Anfrage zurückziehen
                        </button>
                      </form>
                    )}

                    {/* Zeige einen Hinweis, wenn der Benutzer eine aktive Anfrage gestellt hat */}
                    {offer.has_application && offer.application_status !== 'retracted' && (
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {offer.application_status === 'pending' && 'Sie haben eine Anfrage für dieses Angebot gestellt. Status: Ausstehend'}
                          {offer.application_status === 'approved' && 'Ihre Anfrage wurde angenommen!'}
                          {offer.application_status === 'rejected' && 'Ihre Anfrage wurde abgelehnt.'}
                        </div>
                        <Link
                          href={route('web.applications.show', { id: offer.application_id })}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Zur Anfrage
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Typ-Badge */}
                  <div className="absolute right-0 bottom-0 w-27">
                    <div
                      className="flex flex-row w-full h-full bg-neutral-800 bg-opacity-95 text-white text-sm text-right rounded-tl-lg text-left whitespace-pre-line p-1 pr-2 relative group"
                      onMouseEnter={e => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setTooltipPos({ x: rect.left, y: rect.top });
                        setShowTypeTooltip(true);
                      }}
                      onMouseLeave={() => setShowTypeTooltip(false)}
                    >
                      <UsersRound className="text-white w-5 h-5 mr-2" />
                      <span className="block w-full">{offer.offerer_type}</span>
                    </div>
                    {showTypeTooltip && tooltipPos && createPortal(
                      <span
                        className="fixed z-[9999] pointer-events-none transition-opacity duration-300 opacity-100 w-60"
                        style={{ left: tooltipPos.x - 110, top: tooltipPos.y }}
                      >
                        <span className="block w-fit bg-neutral-800 bg-opacity-95 text-white text-sm rounded-lg text-left whitespace-pre-line p-1">
                          <b>{offer.offerer_type}:</b> {getTooltipText(offer.offerer_type)}
                        </span>
                      </span>,
                      document.body
                    )}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </ModernLayout>
  );
}
