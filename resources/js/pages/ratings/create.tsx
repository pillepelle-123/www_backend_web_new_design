import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Star } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Matches',
        href: '/user-matches',
    },
    {
        title: 'Partner bewerten',
        href: '#',
    },
];

type UserMatchData = {
  id: number;
  title: string;
  company_name: string;
  partner_name: string;
  is_applicant: boolean;
};

export default function Create({ userMatch }: { userMatch: UserMatchData }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const { data, setData, post, processing, errors } = useForm({
    user_match_id: userMatch.id,
    score: 0,
    comment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('web.ratings.store'));
  };

  const handleStarClick = (rating: number) => {
    setData('score', rating);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = starNumber <= (hoveredStar || data.score);
      
      return (
        <button
          key={starNumber}
          type="button"
          onClick={() => handleStarClick(starNumber)}
          onMouseEnter={() => setHoveredStar(starNumber)}
          onMouseLeave={() => setHoveredStar(0)}
          className={`p-1 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          <Star className={`w-8 h-8 ${isActive ? 'fill-current' : ''}`} />
        </button>
      );
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Partner bewerten" />
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-white/10 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Partner bewerten
              </h1>

              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{userMatch.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{userMatch.company_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Sie bewerten: <span className="font-medium">{userMatch.partner_name}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bewertung (1 = schlecht, 5 = hervorragend)
                  </label>
                  <div className="flex items-center gap-1">
                    {renderStars()}
                  </div>
                  {errors.score && (
                    <p className="mt-1 text-sm text-red-600">{errors.score}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kommentar (optional)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Teilen Sie Ihre Erfahrungen mit diesem Partner..."
                  />
                  {errors.comment && (
                    <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Link
                    href={route('web.user-matches.show', userMatch.id)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Abbrechen
                  </Link>
                  <button
                    type="submit"
                    disabled={processing || data.score === 0}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {processing ? 'Wird gespeichert...' : 'Bewertung abgeben'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}