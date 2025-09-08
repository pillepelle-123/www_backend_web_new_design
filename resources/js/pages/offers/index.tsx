// Modern Offers Page with Material Design 3
import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ModernOfferCard } from '@/components/modern/ModernOfferCard';
import { ModernFilterBar } from '@/components/modern/ModernFilterBar';
import { useState, useEffect, useRef, useCallback } from "react";
import { Filter, Search } from "lucide-react";
import { useOffers } from '@/hooks/use-offers';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show Offers',
        href: '/offers',
    },
];

export type Offer = {
  id: number;
  title: string;
  description: string;
  offerer_type: string;
  offer_user: string;
  offer_company: string;
  logo_path: string;
  reward_total_cents: number;
  reward_offerer_percent: number;
  created_at: string;
  average_rating: number;
  status: "draft" | "live" | "hidden" | "matched" | "deleted";
  has_application?: boolean;
  application_status?: string;
  application_id?: number;
  is_offerer?: boolean;
  in_match?: boolean;
  offerer_id: number;
};

export default function ModernOffersIndex({ offers: initialOffers, pagination: initialPagination }) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState({ title: "", offer_company: "" });
  const [filters, setFilters] = useState({
    offerer_type: "",
    status: "",
    average_rating_min: 0,
    created_at_from: "",
  });
  const [sort, setSort] = useState({ field: "created_at", direction: "desc" });

  // Offers Hook für Infinite Scrolling und serverseitige Filterung
  const {
    offers,
    loading,
    error,
    loadMore,
    updateDelayedFilters,
    updateImmediateFilters,
    applyFilters,
    hasMore
  } = useOffers();

  // Observer für Infinite Scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOfferElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries && entries.length > 0 && entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { rootMargin: '200px' });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  // Verzögerte Filter-Änderungen speichern
  useEffect(() => {
    updateDelayedFilters({
      title: search.title,
      offer_company: search.offer_company,
      created_at_from: filters.created_at_from
    });
  }, [search, filters.created_at_from, updateDelayedFilters]);

  // Sofortige Filter-Änderungen speichern und anwenden
  useEffect(() => {
    updateImmediateFilters({
      offerer_type: filters.offerer_type,
      status: filters.status,
      average_rating_min: filters.average_rating_min,
      sort_field: sort.field,
      sort_direction: sort.direction
    });
  }, [filters.offerer_type, filters.status, filters.average_rating_min, sort, updateImmediateFilters]);

  // Funktion zum Anwenden der Filter
  const handleApplyFilters = () => {
    applyFilters();
    if (isMobile) {
      setShowFilters(false);
    }
  };

  // Mobile-Detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter Button für Desktop
  const FilterButton = () => (
    <button
      className="md-button md-button--outlined flex items-center gap-2"
      onClick={() => setShowFilters(!showFilters)}
      aria-label="Filter & Suche öffnen"
      type="button"
    >
      <Filter className="w-4 h-4" />
      Filter
    </button>
  );

  return (
    <ModernLayout
      breadcrumbs={breadcrumbs}
      headerRightContent={!isMobile ? <FilterButton /> : undefined}
    >
      <Head title="Show Offers" />

      {/* Mobile Filter Button */}
      {isMobile && !showFilters && (
        <button
          className="fixed bottom-20 right-4 z-50 md-button md-button--filled rounded-full p-3 shadow-lg"
          onClick={() => setShowFilters(true)}
          aria-label="Filter & Sortierung öffnen"
          type="button"
        >
          <Filter className="w-5 h-5" />
        </button>
      )}

      {/* Modern Filter Bar */}
      <ModernFilterBar
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        sort={sort}
        setSort={setSort}
        show={showFilters}
        isMobile={isMobile}
        onApplyFilters={handleApplyFilters}
        onImmediateFilterChange={() => {}}
        onClose={() => setShowFilters(false)}
      />

      {/* Offers Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--md-on-surface)]">
            Angebote
          </h1>
          <div className="text-sm text-[var(--md-on-surface-variant)]">
            {offers.length} Angebote gefunden
          </div>

        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {offers && offers.length > 0 ? offers.map((offer, index) => {
            // Letztes Element mit Ref für Infinite Scrolling
            if (offers.length === index + 1) {
              return (
                <div ref={lastOfferElementRef} key={`offer-${offer.id}`}>
                  <ModernOfferCard offer={offer} />
                </div>
              );
            } else {
              return <ModernOfferCard key={`offer-${offer.id}`} offer={offer} />;
            }
          }) : null}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="md-spinner"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="md-empty-state">
              <div className="text-[var(--md-error)] text-lg font-medium mb-2">
                Fehler beim Laden
              </div>
              <p className="text-[var(--md-on-surface-variant)] mb-4">
                {error}
              </p>
              <button
                onClick={() => loadMore()}
                className="md-button md-button--filled"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        )}

        {/* End of List */}
        {!hasMore && offers.length > 0 && (
          <div className="text-center py-8">
            <div className="text-[var(--md-on-surface-variant)]">
              Keine weiteren Angebote verfügbar
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && offers.length === 0 && (
          <div className="text-center py-16">
            <div className="md-empty-state">
              <Search className="md-empty-state-icon" />
              <h3 className="md-empty-state-title">
                Keine Angebote gefunden
              </h3>
              <p className="md-empty-state-description">
                Versuche deine Suchkriterien zu ändern oder erstelle ein neues Angebot.
              </p>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
