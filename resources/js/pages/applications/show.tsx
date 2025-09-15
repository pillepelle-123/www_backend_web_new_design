import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Clock, XCircle, ArchiveX, Building2, UserRound, UsersRound } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Nachrichten',
        href: '/applications',
    },
    {
        title: 'Details',
        href: '#',
    },
];

type ApplicationDetails = {
  id: number;
  offer_id: number;
  title: string;
  description: string;
  company_name: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  responded_at: string | null;
  is_applicant: boolean;
  user_role: 'referrer' | 'referred';
  applicant: {
    id: number;
    name: string;
  };
  offerer: {
    id: number;
    name: string;
  };
  is_archived_by_partner: boolean;
  partner_action: string | null;
};

export default function Show({ application }: { application: ApplicationDetails }) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="md-badge md-badge--primary">
            <Clock className="w-3 h-3" /> Ausstehend
          </span>
        );
      case 'approved':
        return (
          <span className="md-badge md-badge--success">
            <CheckCircle className="w-3 h-3" /> Genehmigt
          </span>
        );
      case 'rejected':
        return (
          <span className="md-badge md-badge--error">
            <XCircle className="w-3 h-3" /> Abgelehnt
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <ModernLayout breadcrumbs={breadcrumbs}>
      <Head title={`Anfrage: ${application.title}`} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
            {application.title}
          </h1>
          <div>
            {getStatusBadge(application.status)}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Unternehmen</p>
          <p className="font-medium text-[var(--md-on-surface)]">{application.company_name}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Erstellt am</p>
          <p className="font-medium text-[var(--md-on-surface)]">{formatDate(application.created_at)}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Anfragender</p>
          <p className="font-medium text-[var(--md-on-surface)]">{application.applicant.name}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Anbieter</p>
          <p className="font-medium text-[var(--md-on-surface)]">{application.offerer.name}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Ihre Rolle</p>
          <p className="font-medium text-[var(--md-on-surface)]">{application.user_role === 'referrer' ? 'Werbender' : 'Beworbener'}</p>
        </div>
        {application.responded_at && (
          <div>
            <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Beantwortet am</p>
            <p className="font-medium text-[var(--md-on-surface)]">{formatDate(application.responded_at)}</p>
          </div>
        )}
        {application.partner_action && (
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Partner-Aktion</p>
            <p className="font-medium text-[var(--md-primary)]">{application.partner_action}</p>
          </div>
        )}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="md-card md-card--elevated p-6">
          <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Angebotsbeschreibung
          </h2>
          <p className="text-[var(--md-on-surface)]">{application.description}</p>
        </div>

        {application.message && (
          <div className="md-card md-card--elevated p-6">
            <h2 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4 flex items-center gap-2">
              <UserRound className="w-5 h-5" />
              Nachricht
            </h2>
            <p className="text-[var(--md-on-surface)]">{application.message}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Link
            href={route('web.applications.index')}
            className="md-button md-button--outlined"
            preserveState={false}
            only={[]}
          >
            Zurück zur Übersicht
          </Link>
          <Link
            href={route('web.offers.show', { id: application.offer_id })}
            className="md-button md-button--outlined"
          >
            Zum Angebot
          </Link>
          {application.is_archived_by_partner && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] rounded-lg">
              <ArchiveX className="w-4 h-4" />
              Archiviert von Partner
            </div>
          )}
        </div>

        {!application.is_applicant && application.status === 'pending' && (
          <div className="flex gap-2">
            <Link
              href={route('web.applications.reject', application.id)}
              method="post"
              as="button"
              className="md-button md-button--outlined text-[var(--md-error)] border-[var(--md-error)] hover:bg-[var(--md-error-container)]"
              preserveState={false}
            >
              Ablehnen
            </Link>
            <Link
              href={route('web.applications.approve', application.id)}
              method="post"
              as="button"
              className="md-button md-button--filled"
              preserveState={false}
            >
              Genehmigen
            </Link>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
