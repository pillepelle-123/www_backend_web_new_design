import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Star } from 'lucide-react';

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
          className={`w-4 h-4 ${isActive ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Bewertungen von ${user.name}`} />
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-white/10 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Bewertungen von {user.name}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.floor(user.average_rating))}
                  </div>
                  <span className="text-lg font-medium">
                    {user.average_rating.toFixed(1)}/5
                  </span>
                  <span className="text-sm text-gray-500">
                    ({ratings.total} Bewertungen)
                  </span>
                </div>
              </div>

              {ratings.data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Noch keine Bewertungen vorhanden
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.data.map((rating, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(rating.score)}
                          <span className="ml-2 font-medium">{rating.score}/5</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(rating.created_at)}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                          {rating.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {ratings.last_page > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center gap-2">
                    {ratings.links.map((link, index) => (
                      <div key={index}>
                        {link.url ? (
                          <Link
                            href={link.url}
                            className={`px-3 py-2 text-sm rounded-md ${
                              link.active
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        ) : (
                          <span
                            className="px-3 py-2 text-sm text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}