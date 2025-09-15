import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Star, UserRound, MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bewertungen',
        href: '#',
    },
];

type UserData = {
  id: number;
  name: string;
  average_rating: number;
};

type RatingData = {
  score: number;
  comment: string | null;
  created_at: string;
};

type PaginationData = {
  data: RatingData[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
};

export default function UserIndex({ user, ratings }: { user: UserData, ratings: PaginationData }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', ' | ');
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = starNumber <= score;
      
      return (
        <Star
          key={starNumber}
          className={`w-5 h-5 ${isActive ? 'fill-yellow-500 stroke-yellow-500' : 'fill-none stroke-yellow-500'}`}
        />
      );
    });
  };

  return (
    <ModernLayout breadcrumbs={breadcrumbs}>
      <Head title={`Bewertungen von ${user.name}`} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--md-on-surface)] mb-4">
          Bewertungen von {user.name}
        </h1>
        
        {/* User Rating Summary */}
        <div className="md-card md-card--elevated p-6">
          <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
            <UserRound className="w-5 h-5" />
            Durchschnittsbewertung
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(Math.floor(user.average_rating))}
            </div>
            <span className="text-lg font-medium text-[var(--md-on-surface)]">
              {user.average_rating.toFixed(1)}/5
            </span>
            <span className="text-sm text-[var(--md-on-surface-variant)]">
              ({ratings.total} Bewertungen)
            </span>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      {ratings.data.length === 0 ? (
        <div className="md-empty-state">
          <Star className="md-empty-state-icon" />
          <h3 className="md-empty-state-title">
            Noch keine Bewertungen vorhanden
          </h3>
          <p className="md-empty-state-description">
            Dieser Benutzer hat noch keine Bewertungen erhalten.
          </p>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {ratings.data.map((rating, index) => (
            <div key={index} className="md-card md-card--elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[var(--md-on-surface-variant)]" />
                  <div className="flex items-center gap-1">
                    {renderStars(rating.score)}
                    <span className="ml-2 text-lg font-medium text-[var(--md-on-surface)]">{rating.score}/5</span>
                  </div>
                </div>
                <span className="text-sm text-[var(--md-on-surface-variant)]">
                  {formatDate(rating.created_at)}
                </span>
              </div>
              {rating.comment && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--md-on-surface-variant)] mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Kommentar
                  </h3>
                  <p className="text-[var(--md-on-surface)]">
                    {rating.comment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {ratings.last_page > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center gap-2">
            {ratings.links.map((link, index) => (
              <div key={index}>
                {link.url ? (
                  <Link
                    href={link.url}
                    className={`md-button ${
                      link.active
                        ? 'md-button--filled'
                        : 'md-button--outlined'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ) : (
                  <span
                    className="px-3 py-2 text-sm text-[var(--md-on-surface-variant)]"
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </ModernLayout>
  );
}