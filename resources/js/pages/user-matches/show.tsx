import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Handshake, ArrowLeftRight, DivideIcon, ArchiveX, Building2, Euro, Users, Target, MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Matches',
        href: '/user-matches',
    },
    {
        title: 'Details',
        href: '#',
    },
];

type UserMatchDetails = {
  id: number;
  title: string;
  description: string;
  company_name: string;
  affiliate_url: string | null;
  status: 'opened' | 'closed';
  success_status: 'pending' | 'successful' | 'unsuccessful';
  created_at: string;
  is_applicant: boolean;
  user_name: string;
  user_role: 'referrer' | 'referred';
  partner_name: string;
  partner_role: 'referrer' | 'referred';
  reward_total_euro: number;
  user_reward: number;
  user_reward_percent: number;
  partner_reward: number;
  partner_reward_percent: number;
  application_message: string | null;
  is_archived_by_partner: boolean;
  partner_action: string | null;
  user_rating_id: number | null;
};

export default function Show({ userMatch }: { userMatch: UserMatchDetails }) {
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

  return (
    <ModernLayout breadcrumbs={breadcrumbs}>
      <Head title={`Match: ${userMatch.title}`} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
          Match Details
        </h1>
      </div>

      {/* Offer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Titel</p>
          <p className="font-medium text-[var(--md-on-surface)]">{userMatch.title}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Unternehmen</p>
          <p className="font-medium text-[var(--md-on-surface)]">{userMatch.company_name}</p>
        </div>
        {userMatch.affiliate_url && (
          <div className="md:col-span-2">
            <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Affiliate Link</p>
            <a
              href={userMatch.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--md-primary)] hover:text-[var(--md-primary-container)] underline break-all"
            >
              {userMatch.affiliate_url}
            </a>
          </div>
        )}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Beschreibung */}
        <div className="md-card md-card--elevated p-6">
          <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Beschreibung
          </h2>
          <p className="text-[var(--md-on-surface)]">{userMatch.description}</p>
        </div>

        {/* Match Partner Section */}
        <div className="md-card md-card--elevated p-6">
          <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            Match Partner
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="font-medium text-[var(--md-on-surface)]">{userMatch.user_name}</p>
              <p className="text-sm text-[var(--md-on-surface-variant)]">
                {userMatch.user_role === 'referrer' ? 'Werbender' : 'Beworbener'} (Sie)
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Handshake className="w-8 h-8 text-[var(--md-primary)]" />
              <ArrowLeftRight className="w-6 h-6 text-[var(--md-on-surface-variant)]" />
            </div>
            <div className="text-center">
              <p className="font-medium text-[var(--md-on-surface)]">{userMatch.partner_name}</p>
              <p className="text-sm text-[var(--md-on-surface-variant)]">
                {userMatch.partner_role === 'referrer' ? 'Werbender' : 'Beworbener'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[var(--md-surface-container)] rounded-lg">
              <p className="font-bold text-2xl text-[var(--md-success)]">{userMatch.user_reward.toFixed(2)}€</p>
              <p className="text-sm text-[var(--md-on-surface-variant)]">
                Anteil für dich ({userMatch.user_reward_percent} %)
              </p>
            </div>
            <div className="text-center p-4 bg-[var(--md-surface-container)] rounded-lg">
              <p className="text-2xl text-[var(--md-on-surface)]">{userMatch.reward_total_euro.toFixed(2)}€</p>
              <p className="text-sm text-[var(--md-on-surface-variant)]">Gesamtbelohnung</p>
            </div>
            <div className="text-center p-4 bg-[var(--md-surface-container)] rounded-lg">
              <p className="text-xl text-[var(--md-on-surface)]">{userMatch.partner_reward.toFixed(2)}€</p>
              <p className="text-sm text-[var(--md-on-surface-variant)]">
                Anteil für Partner ({userMatch.partner_reward_percent} %)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Section */}
      {userMatch.application_message && (
        <div className="mb-8">
          <div className="md-card md-card--elevated p-6">
            <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Application
            </h2>
            <p className="text-[var(--md-on-surface)]">{userMatch.application_message}</p>
          </div>
        </div>
      )}

      {/* Match Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Match erstellt</p>
          <p className="font-medium text-[var(--md-on-surface)]">{formatDate(userMatch.created_at)}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Status</p>
          <p className="font-medium text-[var(--md-on-surface)]">
            {userMatch.status === 'opened' ? 'Aktiv' :
             userMatch.success_status === 'successful' ? 'Erfolgreich abgeschlossen' : 'Erfolglos beendet'}
          </p>
        </div>
        {userMatch.partner_action && (
          <div>
            <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Partner-Aktion</p>
            <p className="font-medium text-[var(--md-primary)]">{userMatch.partner_action}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Link
            href={route('web.user-matches.index')}
            className="md-button md-button--outlined"
            preserveState={false}
          >
            Zurück zur Übersicht
          </Link>
          {userMatch.user_rating_id ? (
            <Link
              href={route('web.ratings.show', userMatch.user_rating_id)}
              className="md-button md-button--filled"
            >
              Bewertung ansehen
            </Link>
          ) : (
            <Link
              href={route('web.ratings.create', { userMatchId: userMatch.id })}
              className="md-button md-button--filled"
            >
              Partner bewerten
            </Link>
          )}
          {userMatch.is_archived_by_partner && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] rounded-lg">
              <ArchiveX className="w-4 h-4" />
              Archiviert von Partner
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
