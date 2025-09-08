import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
  CheckCircle,
  CircleCheck,
  CircleX,
  CircleAlert,
  Handshake,
  Archive,
  ArchiveX,
  Target,
  Users,
  Euro
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Matches',
        href: '/user-matches',
    },
];

type UserMatch = {
  id: number;
  title: string;
  company_name: string;
  status: 'opened' | 'closed';
  success_status: 'pending' | 'successful' | 'unsuccessful';
  created_at: string;
  is_applicant: boolean;
  user_role: 'referrer' | 'referred';
  partner_name: string;
  partner_role: 'referrer' | 'referred';
  user_reward: number;
  is_archived: boolean;
  is_archived_by_partner: boolean;
  partner_action: string | null;
};

export default function ModernUserMatchesIndex({ userMatches }: { userMatches: UserMatch[] }) {
  const [activeTab, setActiveTab] = useState<'matches' | 'archive'>('matches');
  const [dissolveDialogOpen, setDissolveDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const filteredMatches = userMatches.filter(match => {
    if (activeTab === 'matches' && match.is_archived) return false;
    if (activeTab === 'archive' && !match.is_archived) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusBadge = (status: string, successStatus: string) => {
    if (status === 'opened') {
      return (
        <span className="md-badge md-badge--success">
          <CheckCircle className="w-3 h-3" /> Aktiv
        </span>
      );
    }

    if (successStatus === 'successful') {
      return (
        <span className="md-badge md-badge--primary">
          <CircleCheck className="w-3 h-3" /> Erfolgreich
        </span>
      );
    }

    return (
      <span className="md-badge md-badge--error">
        <CircleX className="w-3 h-3" /> Erfolglos
      </span>
    );
  };

  return (
    <ModernLayout breadcrumbs={breadcrumbs}>
      <Head title="Matches" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
            Matches
          </h1>
          <div className="text-sm text-[var(--md-on-surface-variant)]">
            {filteredMatches.length} {activeTab === 'matches' ? 'aktive' : 'archivierte'} Matches
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--md-outline-variant)]">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'matches'
                ? 'border-b-2 border-[var(--md-primary)] text-[var(--md-primary)]'
                : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Handshake className="w-4 h-4" />
            Aktive Matches
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'archive'
                ? 'border-b-2 border-[var(--md-primary)] text-[var(--md-primary)]'
                : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Archive className="w-4 h-4" />
            Archiv
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {activeTab === 'matches' && filteredMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md-card md-card--elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Aktive Matches</p>
                <p className="text-2xl font-bold text-[var(--md-on-surface)]">
                  {filteredMatches.filter(m => m.status === 'opened').length}
                </p>
              </div>
              <div className="p-3 bg-[var(--md-primary-container)] rounded-lg">
                <Handshake className="w-6 h-6 text-[var(--md-on-primary-container)]" />
              </div>
            </div>
          </div>

          <div className="md-card md-card--elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Erfolgreiche Matches</p>
                <p className="text-2xl font-bold text-[var(--md-on-surface)]">
                  {filteredMatches.filter(m => m.success_status === 'successful').length}
                </p>
              </div>
              <div className="p-3 bg-[var(--md-success-container)] rounded-lg">
                <CircleCheck className="w-6 h-6 text-[var(--md-on-success-container)]" />
              </div>
            </div>
          </div>

          <div className="md-card md-card--elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Gesamtprämie</p>
                <p className="text-2xl font-bold text-[var(--md-on-surface)]">
                  {formatCurrency(filteredMatches.reduce((sum, m) => sum + m.user_reward, 0))}
                </p>
              </div>
              <div className="p-3 bg-[var(--md-tertiary-container)] rounded-lg">
                <Euro className="w-6 h-6 text-[var(--md-on-tertiary-container)]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <div className="md-empty-state">
          <Handshake className="md-empty-state-icon" />
          <h3 className="md-empty-state-title">
            {activeTab === 'matches' ? 'Keine aktiven Matches gefunden' : 'Keine archivierten Matches gefunden'}
          </h3>
          <p className="md-empty-state-description">
            {activeTab === 'matches'
              ? 'Du hast derzeit keine aktiven Matches. Erstelle ein Angebot oder bewerbe dich auf bestehende Angebote.'
              : 'Es wurden keine archivierten Matches gefunden.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="md-card md-card--elevated p-6 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-[var(--md-primary-container)] rounded-lg flex items-center justify-center">
                    <Handshake className="w-5 h-5 text-[var(--md-on-primary-container)]" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      href={`/user-matches/${match.id}`}
                      className="font-semibold text-[var(--md-on-surface)] hover:text-[var(--md-primary)] transition-colors truncate"
                      preserveState={false}
                    >
                      {match.title}
                    </Link>
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusBadge(match.status, match.success_status)}
                      <span className="text-sm text-[var(--md-on-surface-variant)]">
                        {formatDate(match.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm text-[var(--md-on-surface-variant)] mb-2">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{match.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Partner: {match.partner_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          <span className="font-medium text-[var(--md-on-surface)]">
                            {formatCurrency(match.user_reward)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[var(--md-on-surface-variant)]">
                        Sie sind: {match.user_role === 'referrer' ? 'Werbender' : 'Beworbener'} •
                        Partner ist: {match.partner_role === 'referrer' ? 'Werbender' : 'Beworbener'}
                      </div>

                      {match.partner_action && (
                        <p className="text-xs text-[var(--md-primary)] mt-2">
                          {match.partner_action}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {match.status === 'opened' && activeTab === 'matches' && (
                        <div className="flex gap-1">
                          <Link
                            href={route('web.user-matches.mark-successful', { id: match.id })}
                            method="post"
                            as="button"
                            className="md-button md-button--filled text-xs p-2"
                            title="Match als erfolgreich abschließen"
                            preserveState={false}
                          >
                            <CircleCheck className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedMatchId(match.id);
                              setDissolveDialogOpen(true);
                            }}
                            className="md-button md-button--outlined text-xs p-2 text-[var(--md-error)] border-[var(--md-error)] hover:bg-[var(--md-error-container)]"
                            title="Match auflösen"
                          >
                            <CircleX className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => console.log(`Match ${match.id} gemeldet`)}
                            className="md-button md-button--outlined text-xs p-2 text-[var(--md-tertiary)] border-[var(--md-tertiary)] hover:bg-[var(--md-tertiary-container)]"
                            title="Match Partner melden"
                          >
                            <CircleAlert className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedMatchId(match.id);
                          setArchiveDialogOpen(true);
                        }}
                        className="md-button md-button--outlined text-xs p-2"
                        title="Archivieren"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AlertDialog open={dissolveDialogOpen} onOpenChange={setDissolveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Match auflösen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Match auflösen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedMatchId) {
                  router.post(route('web.user-matches.dissolve', { id: selectedMatchId }));
                }
              }}
            >
              Match auflösen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Match archivieren</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Match archivieren möchten? Sie können ihn später wiederherstellen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedMatchId) {
                  router.post(route('web.user-matches.archive', { id: selectedMatchId }));
                }
              }}
            >
              Archivieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModernLayout>
  );
}
