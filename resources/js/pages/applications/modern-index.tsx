import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  MailOpen,
  Ban,
  Archive,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Square,
  CheckSquare,
  Filter,
  MoreHorizontal,
  ArchiveX,
  Inbox,
  Archive as ArchiveIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Nachrichten',
        href: '/applications',
    },
];

type Application = {
  id: number;
  offer_id: number;
  title: string;
  company_name: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'retracted';
  created_at: string;
  responded_at: string | null;
  is_unread: boolean;
  is_applicant: boolean;
  is_archived: boolean;
  other_user: string;
  user_role: 'referrer' | 'referred';
  is_archived_by_partner: boolean;
  partner_action: string | null;
};

export default function ModernApplicationsIndex({ applications, unreadCount }: { applications: Application[], unreadCount: number }) {
  const [activeTab, setActiveTab] = useState<'applications' | 'archive'>('applications');
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'retracted'>('all');
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredApplications = applications.filter(app => {
    // Filter nach Tab (Anträge/Archiv)
    if (activeTab === 'applications' && app.is_archived) return false;
    if (activeTab === 'archive' && !app.is_archived) return false;

    // Filter nach Typ (gesendet/empfangen)
    if (filter !== 'all') {
      if (filter === 'sent' && !app.is_applicant) return false;
      if (filter === 'received' && app.is_applicant) return false;
    }

    // Filter nach Status (nur im Anträge-Tab)
    if (activeTab === 'applications' && statusFilter !== 'all' && app.status !== statusFilter) return false;

    return true;
  });

  // Hilfsfunktionen für Checkboxen
  const toggleSelectApplication = (id: number) => {
    if (selectedApplications.includes(id)) {
      setSelectedApplications(selectedApplications.filter(appId => appId !== id));
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
    setSelectAll(!selectAll);
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchInfo, setMatchInfo] = useState<{hasActiveMatch: boolean, matchStatus: string | null}>({hasActiveMatch: false, matchStatus: null});
  const [pendingApplicationId, setPendingApplicationId] = useState<number | null>(null);
  const [pendingMatchAction, setPendingMatchAction] = useState<'retract' | 'reject' | 'archive' | null>(null);

  // Hilfsfunktion für Bulk-Aktionen
  const handleBulkAction = (action: string) => {
    if (selectedApplications.length === 0) return;

    if(action === 'approve' || action === 'archive' || action === 'unarchive') {
      // Speichere die Aktion und öffne den Dialog
      setPendingAction(action);
      setConfirmDialogOpen(true);
      return;
    }

    // Führe die Aktion direkt aus, wenn keine Bestätigung erforderlich ist
    executeBulkAction(action);
  };

  // Führt die Bulk-Aktion nach Bestätigung aus
  const executeBulkAction = (action: string) => {
    // Führe die entsprechende Aktion für jede ausgewählte Anwendung aus
    const promises = selectedApplications.map(id => {
      switch (action) {
        case 'markAsRead':
          return fetch(route('web.applications.mark-read', { id }), {
            method: 'POST',
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
              'Content-Type': 'application/json',
            }
          });

        case 'markAsUnread':
          return fetch(route('web.applications.toggle-read', { id }), {
            method: 'POST',
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_unread: false })
          });

        case 'archive':
          return fetch(route('web.applications.archive', { id }), {
            method: 'POST',
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
              'Content-Type': 'application/json',
            }
          });

        case 'unarchive':
          return fetch(route('web.applications.unarchive', { id }), {
            method: 'POST',
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
              'Content-Type': 'application/json',
            }
          });

        default:
          return Promise.resolve();
      }
    });

    // Warte auf alle Anfragen und aktualisiere dann die Seite
    Promise.all(promises)
      .then(() => {
        window.location.reload();
      })
      .catch(error => {
        console.error('Fehler bei der Bulk-Aktion:', error);
        alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
      });
  };

  // Hilfsfunktion zum Umschalten des Lesestatus einer Nachricht
  const toggleReadStatus = (applicationId: number, currentIsUnread: boolean) => {
    fetch(route('web.applications.toggle-read', { id: applicationId }), {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_unread: currentIsUnread }),
    }).then(response => {
      if (response.ok) {
        window.location.reload();
      }
    });
  };

  // Hilfsfunktion zum Markieren einer Nachricht als gelesen
  const markAsRead = (applicationId: number) => {
    fetch(route('web.applications.mark-read', { id: applicationId }), {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Content-Type': 'application/json',
      }
    });
  };

  // Prüfe UserMatch und zeige Dialog falls nötig
  const handleActionWithMatchCheck = async (applicationId: number, action: 'retract' | 'reject' | 'archive') => {
    markAsRead(applicationId);
    try {
      const response = await fetch(route('web.applications.check-user-match', { id: applicationId }));
      const data = await response.json();

      if (data.hasActiveMatch) {
        setMatchInfo(data);
        setPendingApplicationId(applicationId);
        setPendingMatchAction(action);
        setMatchDialogOpen(true);
      } else {
        executeAction(applicationId, action);
      }
    } catch (error) {
      console.error('Fehler beim Prüfen der UserMatch:', error);
      executeAction(applicationId, action);
    }
  };

  // Führe Aktion aus
  const executeAction = (applicationId: number, action: 'retract' | 'reject' | 'archive') => {
    let url;
    switch (action) {
      case 'retract':
        url = route('web.applications.retract', { id: applicationId });
        break;
      case 'reject':
        url = route('web.applications.reject', { id: applicationId });
        break;
      case 'archive':
        url = route('web.applications.archive', { id: applicationId });
        break;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = '_token';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }

    document.body.appendChild(form);
    form.submit();
  };

  // Führe Aktion mit UserMatch-Handling aus
  const executeActionWithMatch = (applicationId: number, action: 'retract' | 'reject' | 'archive') => {
    let url;
    switch (action) {
      case 'retract':
        url = route('web.applications.retract-with-match', { id: applicationId });
        break;
      case 'reject':
        url = route('web.applications.reject-with-match', { id: applicationId });
        break;
      case 'archive':
        url = route('web.applications.archive-with-match', { id: applicationId });
        break;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = '_token';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }

    document.body.appendChild(form);
    form.submit();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
      case 'retracted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]">
            <XCircle className="w-3 h-3" /> Zurückgezogen
          </span>
        );
      default:
        return null;
    }
  };

  // Komponente für den Bestätigungsdialog
  const ConfirmationDialog = () => (
    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            { pendingAction == 'archive' && (
                <span>Archivieren</span>
            )
            }
            { pendingAction == 'unarchive' && (
                <span>Wiederherstellen</span>
            )
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            { pendingAction == 'archive' && (
                <span>Möchten sie {selectedApplications.length} ausgewählte Nachrichten archivieren?</span>
            )
            }
            { pendingAction == 'unarchive' && (
                <span>Möchten sie {selectedApplications.length} ausgewählte Nachrichten wiederherstellen?</span>
            )
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            if (pendingAction) {
              executeBulkAction(pendingAction);
              setPendingAction(null);
            }
          }}>
            Bestätigen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Komponente für UserMatch-Dialog
  const UserMatchDialog = () => {
    const getActionText = () => {
      switch (pendingMatchAction) {
        case 'retract': return 'zurückziehen';
        case 'reject': return 'ablehnen';
        case 'archive': return 'archivieren';
        default: return '';
      }
    };

    const getMatchStatusText = () => {
      return matchInfo.matchStatus === 'pending' ? 'offener' : 'erfolgreich gekennzeichneter';
    };

    return (
      <AlertDialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Match wird aufgelöst</AlertDialogTitle>
            <AlertDialogDescription>
              Wenn Sie die Application {getActionText()}, wird Ihr {getMatchStatusText()} Match zu dieser Application aufgelöst.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pendingApplicationId && pendingMatchAction) {
                executeActionWithMatch(pendingApplicationId, pendingMatchAction);
                setMatchDialogOpen(false);
                setPendingApplicationId(null);
                setPendingMatchAction(null);
              }
            }}>
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <ModernLayout breadcrumbs={breadcrumbs}>
      <Head title="Nachrichten" />
      <ConfirmationDialog />
      <UserMatchDialog />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
            Nachrichten
            {unreadCount > 0 && (
              <span className="ml-3 md-badge md-badge--error">
                {unreadCount} neu
              </span>
            )}
          </h1>
          <button
            className="md-button md-button--outlined flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filter öffnen"
            type="button"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--md-outline-variant)]">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'border-b-2 border-[var(--md-primary)] text-[var(--md-primary)]'
                : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Anträge
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'archive'
                ? 'border-b-2 border-[var(--md-primary)] text-[var(--md-primary)]'
                : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <ArchiveIcon className="w-4 h-4" />
            Archiv
          </button>
        </div>
      </div>

      {/* Filter-Bereich */}
      {showFilters && (
        <div className="md-card md-card--elevated p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender/Empfänger Filter */}
            <div className="space-y-3">
              <h3 className="font-medium text-[var(--md-on-surface)]">Sender/Empfänger</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`md-button ${filter === 'all' ? 'md-button--filled' : 'md-button--outlined'} text-sm`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setFilter('sent')}
                  className={`md-button ${filter === 'sent' ? 'md-button--filled' : 'md-button--outlined'} text-sm`}
                >
                  Gesendet
                </button>
                <button
                  onClick={() => setFilter('received')}
                  className={`md-button ${filter === 'received' ? 'md-button--filled' : 'md-button--outlined'} text-sm`}
                >
                  Empfangen
                </button>
              </div>
            </div>

            {/* Status-Filter nur im Anträge-Tab anzeigen */}
            {activeTab === 'applications' && (
              <div className="space-y-3">
                <h3 className="font-medium text-[var(--md-on-surface)]">Status</h3>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`md-button ${statusFilter === 'all' ? 'md-button--filled' : 'md-button--outlined'} text-sm`}
                  >
                    Alle Status
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`md-button ${statusFilter === 'pending' ? 'md-button--filled' : 'md-button--outlined'} text-sm`}
                  >
                    Ausstehend
                  </button>
                  <button
                    onClick={() => setStatusFilter('approved')}
                    className={`md-button ${statusFilter === 'approved' ? 'md-button--filled' : 'md-button--outlined'} text-sm`}
                  >
                    Genehmigt
                  </button>
                  <button
                    onClick={() => setStatusFilter('rejected')}
                    className={`md-button ${statusFilter === 'rejected' ? 'md-button--filled' : 'md-button--outlined'} text-sm`}
                  >
                    Abgelehnt
                  </button>
                  <button
                    onClick={() => setStatusFilter('retracted')}
                    className={`md-button ${statusFilter === 'retracted' ? 'md-button--filled' : 'md-button--outlined'} text-sm`}
                  >
                    Zurückgezogen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <div className="md-card md-card--elevated p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-[var(--md-on-surface-variant)]"
              >
                {selectAll ? (
                  <CheckSquare className="w-5 h-5 text-[var(--md-primary)]" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                Alle auswählen
              </button>
              <span className="text-sm text-[var(--md-on-surface-variant)]">
                {selectedApplications.length} ausgewählt
              </span>
            </div>

            <div className="flex gap-2">
              {activeTab === 'applications' && (
                <>
                  <button
                    onClick={() => handleBulkAction('markAsRead')}
                    className="md-button md-button--text text-sm"
                    title="Als gelesen markieren"
                  >
                    <MailOpen className="w-4 h-4 mr-2" />
                    Als gelesen markieren
                  </button>
                  <button
                    onClick={() => handleBulkAction('markAsUnread')}
                    className="md-button md-button--text text-sm"
                    title="Als ungelesen markieren"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Als ungelesen markieren
                  </button>
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="md-button md-button--text text-sm"
                    title="Archivieren"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archivieren
                  </button>
                </>
              )}
              {activeTab === 'archive' && (
                <button
                  onClick={() => handleBulkAction('unarchive')}
                  className="md-button md-button--text text-sm"
                  title="Wiederherstellen"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Wiederherstellen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="md-empty-state">
          <Mail className="md-empty-state-icon" />
          <h3 className="md-empty-state-title">
            {activeTab === 'applications' ? 'Keine Nachrichten gefunden' : 'Keine archivierten Nachrichten gefunden'}
          </h3>
          <p className="md-empty-state-description">
            {activeTab === 'applications'
              ? 'Es wurden keine Nachrichten gefunden, die deinen Filterkriterien entsprechen.'
              : 'Es wurden keine archivierten Nachrichten gefunden.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className={`md-card md-card--elevated p-6 transition-all duration-200 ${
                application.is_unread ? 'ring-2 ring-[var(--md-primary)]/20' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="flex-shrink-0 mt-1">
                  <button
                    onClick={() => toggleSelectApplication(application.id)}
                    className="flex items-center"
                  >
                    {selectedApplications.includes(application.id) ? (
                      <CheckSquare className="w-5 h-5 text-[var(--md-primary)]" />
                    ) : (
                      <Square className="w-5 h-5 text-[var(--md-on-surface-variant)]" />
                    )}
                  </button>
                </div>

                {/* Read/Unread Icon */}
                <div className="flex-shrink-0 mt-1">
                  {activeTab === 'applications' && (
                    <button
                      onClick={() => toggleReadStatus(application.id, application.is_unread)}
                      className="focus:outline-none cursor-pointer"
                      title={application.is_unread ? "Als gelesen markieren" : "Als ungelesen markieren"}
                    >
                      {application.is_unread ? (
                        <Mail className="w-5 h-5 text-[var(--md-primary)]" />
                      ) : (
                        <MailOpen className="w-5 h-5 text-[var(--md-on-surface-variant)]" />
                      )}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/applications/${application.id}`}
                      className="font-semibold text-[var(--md-on-surface)] hover:text-[var(--md-primary)] transition-colors truncate"
                      preserveState={false}
                    >
                      {application.title}
                    </Link>
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusBadge(application.status)}
                      <span className="text-sm text-[var(--md-on-surface-variant)]">
                        {formatDate(application.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">
                        {application.is_applicant ? 'An: ' : 'Von: '}{application.other_user} • {application.company_name}
                      </p>
                      <p className="text-xs text-[var(--md-on-surface-variant)]">
                        Sie sind: {application.user_role === 'referrer' ? 'Werbender' : 'Beworbener'}
                      </p>
                      {application.partner_action && (
                        <p className="text-xs text-[var(--md-primary)] mt-1">
                          {application.partner_action}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Aktions-Buttons für Empfänger */}
                      {!application.is_applicant && application.status === 'pending' && activeTab === 'applications' && (
                        <div className="flex gap-1">
                          <Link
                            href={route('web.applications.approve', { id: application.id })}
                            method="post"
                            as="button"
                            className="md-button md-button--filled text-xs p-2"
                            title="Annehmen"
                            preserveState={false}
                            onClick={() => markAsRead(application.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleActionWithMatchCheck(application.id, 'reject')}
                            className="md-button md-button--outlined text-xs p-2 text-[var(--md-error)] border-[var(--md-error)] hover:bg-[var(--md-error-container)]"
                            title="Ablehnen"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Ablehnen-Button für Empfänger bei genehmigten Anträgen */}
                      {!application.is_applicant && application.status === 'approved' && activeTab === 'applications' && (
                        <button
                          onClick={() => handleActionWithMatchCheck(application.id, 'reject')}
                          className="md-button md-button--outlined text-xs p-2 text-[var(--md-error)] border-[var(--md-error)] hover:bg-[var(--md-error-container)]"
                          title="Ablehnen"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {/* Annehmen-Button für Empfänger bei abgelehnten Anträgen */}
                      {!application.is_applicant && application.status === 'rejected' && activeTab === 'applications' && (
                        <Link
                          href={route('web.applications.approve', { id: application.id })}
                          method="post"
                          as="button"
                          className="md-button md-button--filled text-xs p-2"
                          title="Annehmen"
                          preserveState={false}
                          onClick={() => markAsRead(application.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Link>
                      )}

                      {/* Zurückziehen-Button für Absender */}
                      {application.is_applicant && (application.status === 'pending' || application.status === 'approved') && activeTab === 'applications' && (
                        <button
                          onClick={() => handleActionWithMatchCheck(application.id, 'retract')}
                          className="md-button md-button--outlined text-xs p-2"
                          title="Zurückziehen"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Erneut stellen-Button für Absender */}
                      {application.is_applicant && application.status === 'retracted' && activeTab === 'applications' && (
                        <Link
                          href={route('web.applications.reapply', { id: application.id })}
                          method="post"
                          as="button"
                          className="md-button md-button--filled text-xs p-2"
                          title="Erneut stellen"
                          preserveState={false}
                          onClick={() => markAsRead(application.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Link>
                      )}

                      {/* Archivieren/Wiederherstellen-Button */}
                      {activeTab === 'applications' && (
                        <button
                          onClick={() => handleActionWithMatchCheck(application.id, 'archive')}
                          className="md-button md-button--outlined text-xs p-2"
                          title="Archivieren"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      {activeTab === 'archive' && (
                        <Link
                          href={route('web.applications.unarchive', { id: application.id })}
                          method="post"
                          as="button"
                          className="md-button md-button--filled text-xs p-2"
                          title="Wiederherstellen"
                          preserveState={false}
                          onClick={() => markAsRead(application.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModernLayout>
  );
}
