import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Star, Building2, UserRound, Calendar, MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Matches',
        href: '/user-matches',
    },
    {
        title: 'Bewertung',
        href: '#',
    },
];

type RatingData = {
  id: number;
  score: number;
  comment: string | null;
  created_at: string;
  user_match_id: number;
  title: string;
  company_name: string;
  partner_name: string;
  is_applicant: boolean;
};

export default function Show({ rating }: { rating: RatingData }) {
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
          className={`w-6 h-6 ${isActive ? 'fill-yellow-500 stroke-yellow-500' : 'fill-none stroke-yellow-500'}`}
        />
      );
    });
  };

  return (
    <ModernLayout breadcrumbs={breadcrumbs}>
      <Head title="Bewertung ansehen" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
          Ihre Bewertung
        </h1>
      </div>

      {/* Match Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Angebot</p>
          <p className="font-medium text-[var(--md-on-surface)]">{rating.title}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Unternehmen</p>
          <p className="font-medium text-[var(--md-on-surface)]">{rating.company_name}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Bewertet</p>
          <p className="font-medium text-[var(--md-on-surface)]">{rating.partner_name}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Bewertung abgegeben am</p>
          <p className="font-medium text-[var(--md-on-surface)]">{formatDate(rating.created_at)}</p>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rating */}
        <div className="md-card md-card--elevated p-6">
          <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Bewertung
          </h2>
          <div className="flex items-center gap-1">
            {renderStars(rating.score)}
            <span className="ml-2 text-lg font-medium text-[var(--md-on-surface)]">{rating.score}/5</span>
          </div>
        </div>

        {/* Comment */}
        {rating.comment && (
          <div className="md-card md-card--elevated p-6">
            <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Kommentar
            </h2>
            <p className="text-[var(--md-on-surface)]">{rating.comment}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Link
          href={route('web.user-matches.show', rating.user_match_id)}
          className="md-button md-button--outlined"
        >
          Zurück zum Match
        </Link>
      </div>
    </ModernLayout>
  );
}
