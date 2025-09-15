// Modern Offers Page with Material Design 3
import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ModernOfferCard } from '@/components/modern/ModernOfferCard';
import { ModernFilterBar } from '@/components/modern/ModernFilterBar';
import { useState, useEffect, useRef, useCallback } from "react";
import { Filter, Search } from "lucide-react";
import { router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show Offers',
        href: '/offers',
    },
];


export default function ModernOffersIndex({ offers: initialOffers, pagination: initialPagination, filters: initialFilters }) {
  const [showFilters, setShowFilters] = useState(initialFilters?.show_filters === '1');
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const page = usePage();
  
  // Initialize state from URL parameters
  const [search, setSearch] = useState({ 
    title: initialFilters?.title || "", 
    offer_company: initialFilters?.company || "" 
  });
  const [filters, setFilters] = useState({
    offerer_type: initialFilters?.type || "",
    status: initialFilters?.status || "",
    average_rating_min: initialFilters?.rating || 0,
    created_at_from: initialFilters?.date_from || "",
  });
  const [sort, setSort] = useState({ 
    field: initialFilters?.sort || "created_at", 
    direction: initialFilters?.order || "desc" 
  });

  const offers = initialOffers?.data || [];
  const pagination = initialPagination;

  // Funktion zum Anwenden der Filter
  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
    
    const params: Record<string, string> = {};
    
    // Add search parameters
    if (search.title) params.title = search.title;
    if (search.offer_company) params.company = search.offer_company;
    
    // Add filter parameters
    if (filters.offerer_type) params.type = filters.offerer_type;
    if (filters.status) params.status = filters.status;
    if (filters.average_rating_min > 0) params.rating = filters.average_rating_min.toString();
    if (filters.created_at_from) params.date_from = filters.created_at_from;
    
    // Add sort parameters
    if (sort.field !== 'created_at') params.sort = sort.field;
    if (sort.direction !== 'desc') params.order = sort.direction;
    
    // Preserve filter bar state
    if (showFilters) params.show_filters = '1';
    
    router.get('/offers', params, {
      preserveState: false,
      onFinish: () => {
        setIsApplyingFilters(false);
        if (isMobile) {
          setShowFilters(false);
        }
      }
    });
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
      aria-label={showFilters ? "Filter & Suche schließen" : "Filter & Suche öffnen"}
      type="button"
    >
      <Filter className="w-4 h-4" />
      {showFilters ? "Filter ausblenden" : "Filter"}
    </button>
  );

  return (
    <ModernLayout
      breadcrumbs={breadcrumbs}
      headerRightContent={!isMobile ? <FilterButton /> : undefined}
      filterBar={
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
      }
    >
      <Head title="Show Offers" />

      {/* Mobile Filter Button */}
      {isMobile && (
        <button
          className="fixed bottom-20 right-4 z-50 md-button md-button--filled rounded-full p-3 shadow-lg"
          onClick={() => setShowFilters(!showFilters)}
          aria-label={showFilters ? "Filter & Sortierung schließen" : "Filter & Sortierung öffnen"}
          type="button"
        >
          <Filter className="w-5 h-5" />
        </button>
      )}

      {/* Offers Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--md-on-surface)]">
            Angebote
          </h1>
          <div className="text-sm text-[var(--md-on-surface-variant)]">
            {pagination?.total || 0} Angebote gefunden
          </div>

        </div>

        {/* Offers Grid */}
        <div className="relative">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${isApplyingFilters ? 'opacity-60' : ''}`}>
            {offers && offers.length > 0 ? offers.map((offer, index) => (
              <ModernOfferCard key={`offer-${offer.id}`} offer={offer} />
            )) : null}
          </div>

          {/* Filter Application Loading Overlay */}
          {isApplyingFilters && (
            <div className="absolute inset-0 bg-[var(--md-surface)]/50 flex items-center justify-center z-20">
              <div className="flex items-center gap-3 bg-[var(--md-surface-container)] px-6 py-4 rounded-lg shadow-lg">
                <div className="md-spinner w-6 h-6"></div>
                <span className="text-base text-[var(--md-on-surface)] font-medium">Filter werden angewendet...</span>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-2">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', pageNum.toString());
                    router.get(`/offers?${params.toString()}`);
                  }}
                  className={`md-button ${
                    pageNum === pagination.current_page
                      ? 'md-button--filled'
                      : 'md-button--outlined'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Empty State */}
        {offers.length === 0 && (
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
