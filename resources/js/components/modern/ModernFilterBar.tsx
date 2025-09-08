import { useState } from 'react';
import { X, Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface SearchState {
  title: string;
  offer_company: string;
}

interface FiltersState {
  offerer_type: string;
  status: string;
  average_rating_min: number;
  created_at_from: string;
}

interface SortState {
  field: string;
  direction: string;
}

interface ModernFilterBarProps {
  search: SearchState;
  setSearch: (search: SearchState) => void;
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  sort: SortState;
  setSort: (sort: SortState) => void;
  show: boolean;
  isMobile: boolean;
  onApplyFilters: () => void;
  onImmediateFilterChange: () => void;
  onClose?: () => void;
}

export function ModernFilterBar({
  search,
  setSearch,
  filters,
  setFilters,
  sort,
  setSort,
  show,
  isMobile,
  onApplyFilters,
  onImmediateFilterChange,
  onClose
}: ModernFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSort, setLocalSort] = useState(sort);

  const handleSearchChange = (field: keyof SearchState, value: string) => {
    const newSearch = { ...localSearch, [field]: value };
    setLocalSearch(newSearch);
    setSearch(newSearch);
  };

  const handleFilterChange = (field: keyof FiltersState, value: string | number) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const handleSortChange = (field: string, direction: string) => {
    const newSort = { field, direction };
    setLocalSort(newSort);
    setSort(newSort);
  };

  const clearFilters = () => {
    const clearedSearch = { title: "", offer_company: "" };
    const clearedFilters = {
      offerer_type: "",
      status: "",
      average_rating_min: 0,
      created_at_from: "",
    };
    const clearedSort = { field: "created_at", direction: "desc" };

    setLocalSearch(clearedSearch);
    setLocalFilters(clearedFilters);
    setLocalSort(clearedSort);
    setSearch(clearedSearch);
    setFilters(clearedFilters);
    setSort(clearedSort);
  };

  const hasActiveFilters = () => {
    return (
      localSearch.title ||
      localSearch.offer_company ||
      localFilters.offerer_type ||
      localFilters.status ||
      localFilters.average_rating_min > 0 ||
      localFilters.created_at_from ||
      localSort.field !== "created_at" ||
      localSort.direction !== "desc"
    );
  };

  if (!show) return null;

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        <div
          className="fixed inset-0 z-40 bg-[var(--md-scrim)]/50"
          onClick={onClose}
        />

        {/* Mobile Filter Panel */}
        <div className="fixed bottom-0 right-0 z-50 w-full max-w-sm h-[80vh] bg-[var(--md-surface-container-low)] shadow-lg rounded-tl-2xl flex flex-col animate-slide-in-right">
          <div className="flex justify-between items-center p-4 border-b border-[var(--md-outline-variant)]">
            <span className="font-semibold text-[var(--md-on-surface)]">Filter & Sortierung</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--md-surface-container-high)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--md-on-surface-variant)]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--md-on-surface)]">Suche</h3>

              <div className="space-y-3">
                <div>
                  <label className="md-label">Titel</label>
                  <div className="md-search-bar">
                    <Search className="md-search-icon" />
                    <input
                      type="text"
                      value={localSearch.title}
                      onChange={(e) => handleSearchChange('title', e.target.value)}
                      className="md-search-input"
                      placeholder="Angebotstitel suchen..."
                    />
                  </div>
                </div>

                <div>
                  <label className="md-label">Unternehmen</label>
                  <div className="md-search-bar">
                    <Search className="md-search-icon" />
                    <input
                      type="text"
                      value={localSearch.offer_company}
                      onChange={(e) => handleSearchChange('offer_company', e.target.value)}
                      className="md-search-input"
                      placeholder="Unternehmen suchen..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--md-on-surface)]">Filter</h3>

              <div className="space-y-3">
                <div>
                  <label className="md-label">Anbieter-Typ</label>
                  <select
                    value={localFilters.offerer_type}
                    onChange={(e) => handleFilterChange('offerer_type', e.target.value)}
                    className="md-select"
                  >
                    <option value="">Alle</option>
                    <option value="Werbender">Werbender</option>
                    <option value="Beworbener">Beworbener</option>
                  </select>
                </div>

                <div>
                  <label className="md-label">Status</label>
                  <select
                    value={localFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="md-select"
                  >
                    <option value="">Alle</option>
                    <option value="live">Live</option>
                    <option value="draft">Entwurf</option>
                    <option value="matched">Matched</option>
                  </select>
                </div>

                <div>
                  <label className="md-label">Mindestbewertung</label>
                  <select
                    value={localFilters.average_rating_min}
                    onChange={(e) => handleFilterChange('average_rating_min', Number(e.target.value))}
                    className="md-select"
                  >
                    <option value={0}>Alle</option>
                    <option value={1}>1+ Sterne</option>
                    <option value={2}>2+ Sterne</option>
                    <option value={3}>3+ Sterne</option>
                    <option value={4}>4+ Sterne</option>
                    <option value={5}>5 Sterne</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sort Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--md-on-surface)]">Sortierung</h3>

              <div className="space-y-3">
                <div>
                  <label className="md-label">Sortieren nach</label>
                  <select
                    value={localSort.field}
                    onChange={(e) => handleSortChange(e.target.value, localSort.direction)}
                    className="md-select"
                  >
                    <option value="created_at">Erstellungsdatum</option>
                    <option value="title">Titel</option>
                    <option value="reward_total_cents">Prämie</option>
                    <option value="average_rating">Bewertung</option>
                  </select>
                </div>

                <div>
                  <label className="md-label">Richtung</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSortChange(localSort.field, 'desc')}
                      className={`md-button ${localSort.direction === 'desc' ? 'md-button--filled' : 'md-button--outlined'} flex-1`}
                    >
                      <SortDesc className="w-4 h-4 mr-2" />
                      Absteigend
                    </button>
                    <button
                      onClick={() => handleSortChange(localSort.field, 'asc')}
                      className={`md-button ${localSort.direction === 'asc' ? 'md-button--filled' : 'md-button--outlined'} flex-1`}
                    >
                      <SortAsc className="w-4 h-4 mr-2" />
                      Aufsteigend
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="p-4 border-t border-[var(--md-outline-variant)] space-y-3">
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="md-button md-button--text w-full"
              >
                Filter zurücksetzen
              </button>
            )}
            <button
              onClick={onApplyFilters}
              className="md-button md-button--filled w-full"
            >
              Filter anwenden
            </button>
          </div>
        </div>
      </>
    );
  }

  // Desktop Filter Bar
  return (
    <div className="bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)] rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[var(--md-on-surface)] flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter & Sortierung
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="md-button md-button--text"
            >
              Zurücksetzen
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--md-surface-container-high)] transition-colors"
              aria-label="Filter schließen"
            >
              <X className="w-5 h-5 text-[var(--md-on-surface-variant)]" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="md-label">Titel suchen</label>
          <div className="md-search-bar">
            <Search className="md-search-icon" />
            <input
              type="text"
              value={localSearch.title}
              onChange={(e) => handleSearchChange('title', e.target.value)}
              className="md-search-input"
              placeholder="Angebotstitel..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="md-label">Unternehmen</label>
          <div className="md-search-bar">
            <Search className="md-search-icon" />
            <input
              type="text"
              value={localSearch.offer_company}
              onChange={(e) => handleSearchChange('offer_company', e.target.value)}
              className="md-search-input"
              placeholder="Unternehmen..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <label className="md-label">Anbieter-Typ</label>
          <select
            value={localFilters.offerer_type}
            onChange={(e) => handleFilterChange('offerer_type', e.target.value)}
            className="md-select"
          >
            <option value="">Alle</option>
            <option value="Werbender">Werbender</option>
            <option value="Beworbener">Beworbener</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="md-label">Status</label>
          <select
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="md-select"
          >
            <option value="">Alle</option>
            <option value="live">Live</option>
            <option value="draft">Entwurf</option>
            <option value="matched">Matched</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="md-label">Mindestbewertung</label>
          <select
            value={localFilters.average_rating_min}
            onChange={(e) => handleFilterChange('average_rating_min', Number(e.target.value))}
            className="md-select"
          >
            <option value={0}>Alle</option>
            <option value={1}>1+ Sterne</option>
            <option value={2}>2+ Sterne</option>
            <option value={3}>3+ Sterne</option>
            <option value={4}>4+ Sterne</option>
            <option value={5}>5 Sterne</option>
          </select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label className="md-label">Sortieren nach</label>
          <select
            value={localSort.field}
            onChange={(e) => handleSortChange(e.target.value, localSort.direction)}
            className="md-select"
          >
            <option value="created_at">Erstellungsdatum</option>
            <option value="title">Titel</option>
            <option value="reward_total_cents">Prämie</option>
            <option value="average_rating">Bewertung</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="md-label">Richtung</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange(localSort.field, 'desc')}
              className={`md-button ${localSort.direction === 'desc' ? 'md-button--filled' : 'md-button--outlined'} flex-1`}
            >
              <SortDesc className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSortChange(localSort.field, 'asc')}
              className={`md-button ${localSort.direction === 'asc' ? 'md-button--filled' : 'md-button--outlined'} flex-1`}
            >
              <SortAsc className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={onApplyFilters}
            className="md-button md-button--filled w-full"
          >
            Filter anwenden
          </button>
        </div>
      </div>
    </div>
  );
}
