// Modern Offers Page with Material Design 3
import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ModernOfferCard } from '@/components/modern/ModernOfferCard';
import { ModernFilterBar } from '@/components/modern/ModernFilterBar';
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Filter, Search } from "lucide-react";
import { router, usePage } from '@inertiajs/react';
import Fuse from 'fuse.js';

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
    search: initialFilters?.search || ""
  });

  // Handle global search from header
  const [globalSearch, setGlobalSearch] = useState("");

  // Update globalSearch from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientSearch = urlParams.get('client_search') || "";
    setGlobalSearch(clientSearch);
    // Also update search state for filter bar
    if (clientSearch) {
      setSearch({ search: clientSearch });
    }
  }, [window.location.search]);
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

  const allOffers = initialOffers?.data || [];
  const pagination = initialPagination;

  // Fuse.js setup for client-side fuzzy search
  const titleFuse = useMemo(() => new Fuse(allOffers, {
    keys: ['title'],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true
  }), [allOffers]);

  const companyFuse = useMemo(() => new Fuse(allOffers, {
    keys: ['offer_company'],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true
  }), [allOffers]);

  // Apply fuzzy search filtering
  const offers = useMemo(() => {
    let filtered = allOffers;

    // Global search from header (searches both title AND company with OR logic)
    if (globalSearch.trim()) {
      const matchedIds = new Set<number>();

      // Search in titles with fuzzy matching
      const titleResults = titleFuse.search(globalSearch.trim());
      titleResults.forEach(result => matchedIds.add(result.item.id));

      // Search in companies with fuzzy matching
      const companyResults = companyFuse.search(globalSearch.trim());
      companyResults.forEach(result => matchedIds.add(result.item.id));

      // Always filter by fuzzy matches
      filtered = filtered.filter(offer => matchedIds.has(offer.id));
    }
    // Search from filter bar
    else if (search.search.trim()) {
      const matchedIds = new Set<number>();

      // Search in titles
      const titleResults = titleFuse.search(search.search.trim());
      titleResults.forEach(result => matchedIds.add(result.item.id));

      // Search in companies
      const companyResults = companyFuse.search(search.search.trim());
      companyResults.forEach(result => matchedIds.add(result.item.id));

      // Filter to only matched offers (OR logic)
      filtered = filtered.filter(offer => matchedIds.has(offer.id));
    }

    // Apply other filters
    if (filters.offerer_type) {
      filtered = filtered.filter(offer => offer.offerer_type === filters.offerer_type);
    }
    if (filters.status) {
      filtered = filtered.filter(offer => offer.status === filters.status);
    }
    if (filters.average_rating_min > 0) {
      filtered = filtered.filter(offer => (offer.average_rating || 0) >= filters.average_rating_min);
    }
    if (filters.created_at_from) {
      filtered = filtered.filter(offer => new Date(offer.created_at) >= new Date(filters.created_at_from));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sort.field) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'reward_total_cents':
          aValue = a.reward_total_cents || 0;
          bValue = b.reward_total_cents || 0;
          break;
        case 'average_rating':
          aValue = a.average_rating || 0;
          bValue = b.average_rating || 0;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allOffers, search, filters, sort, titleFuse, companyFuse, globalSearch]);

  // Funktion zum Anwenden der Filter (with visual feedback)
  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
  };

  // Handle filter completion
  useEffect(() => {
    if (isApplyingFilters) {
      const timer = setTimeout(() => {
        setIsApplyingFilters(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isApplyingFilters]);

  // Mobile-Detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide Inertia progress bar on this page
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = '#nprogress { display: none !important; }';
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
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
      {showFilters ? "Filter ausblenden" : "Filter einblenden"}
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
          offers={allOffers}
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
            {offers.length} von {pagination?.total || 0} Angeboten gefunden
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
                    router.get(`/offers?${params.toString()}`, {}, {
                      preserveState: true,
                      preserveScroll: false
                    });
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
