import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Star } from 'lucide-react';

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
          className={`w-6 h-6 ${isActive ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Bewertung ansehen" />
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-white/10 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Ihre Bewertung
              </h1>

              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{rating.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{rating.company_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Sie haben bewertet: <span className="font-medium">{rating.partner_name}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bewertung
                  </label>
                  <div className="flex items-center gap-1">
                    {renderStars(rating.score)}
                    <span className="ml-2 text-lg font-medium">{rating.score}/5</span>
                  </div>
                </div>

                {rating.comment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kommentar
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-300">{rating.comment}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bewertung abgegeben am
                  </label>
                  <p className="text-gray-600 dark:text-gray-300">{formatDate(rating.created_at)}</p>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Link
                  href={route('web.user-matches.show', rating.user_match_id)}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Zurück zum Match
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}