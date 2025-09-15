import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
  TrendingUp,
  Users,
  Handshake,
  Mail,
  Plus,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


export default function ModernDashboard({ auth, activeOffersCount, newOffersLast7Days, unreadApplicationsCount, totalApplicationsCount }: PageProps & { activeOffersCount: number; newOffersLast7Days: number; unreadApplicationsCount?: number; totalApplicationsCount: number }) {
    const unreadCount = unreadApplicationsCount || 0;

    return (
        <ModernLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--md-on-surface)] mb-2">
                    Willkommen zurück, {auth.user.name}!
                </h1>
                <p className="text-[var(--md-on-surface-variant)]">
                    Hier ist eine Übersicht über deine Aktivitäten und Statistiken.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="md-card md-card--elevated p-6">
                    <p className="text-sm text-[var(--md-on-surface-variant)] mb-4">Aktive Angebote</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-[var(--md-on-surface)]">{activeOffersCount}</p>
                            <div className="mt-2 flex items-center text-sm">
                                <TrendingUp className="w-4 h-4 text-[var(--md-success)] mr-1" />
                                <span className="text-[var(--md-success)]">+{newOffersLast7Days} letzte 7 Tage</span>
                            </div>
                        </div>
                        <div className="p-3 bg-[var(--md-primary-container)] rounded-lg">
                            <Target className="w-6 h-6 text-[var(--md-on-primary-container)]" />
                        </div>
                    </div>
                </div>

{ /*}
                <div className="md-card md-card--elevated p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--md-on-surface-variant)] mb-1">Anfragen</p>
                            <p className="text-2xl font-bold text-[var(--md-on-surface)]">8</p>
                        </div>
                        <div className="p-3 bg-[var(--md-secondary-container)] rounded-lg">
                            <Users className="w-6 h-6 text-[var(--md-on-secondary-container)]" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <Activity className="w-4 h-4 text-[var(--md-primary)] mr-1" />
                        <span className="text-[var(--md-primary)]">3 neue heute</span>
                    </div>
                </div>
*/}

                <div className="md-card md-card--elevated p-6">
                    <p className="text-sm text-[var(--md-on-surface-variant)] mb-4">Anfragen</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-[var(--md-on-surface)]">{unreadCount}</p>
                            <div className="mt-2 text-sm">
                                <span className="text-[var(--md-on-surface-variant)]">Ungelesen</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--md-on-surface)]">{totalApplicationsCount}</p>
                            <div className="mt-2 text-sm">
                                <span className="text-[var(--md-on-surface-variant)]">Alle</span>
                            </div>
                        </div>
                        <div className="p-3 bg-[var(--md-error-container)] rounded-lg">
                            <Mail className="w-6 h-6 text-[var(--md-on-error-container)]" />
                        </div>
                    </div>
                </div>

                <div className="md-card md-card--elevated p-6">
                    <p className="text-sm text-[var(--md-on-surface-variant)] mb-4">Matches</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-[var(--md-on-surface)]">5</p>
                            <div className="mt-2 flex items-center text-sm">
                                <TrendingUp className="w-4 h-4 text-[var(--md-success)] mr-1" />
                                <span className="text-[var(--md-success)]">+1 diese Woche</span>
                            </div>
                        </div>
                        <div className="p-3 bg-[var(--md-tertiary-container)] rounded-lg">
                            <Handshake className="w-6 h-6 text-[var(--md-on-tertiary-container)]" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="md-card md-card--elevated p-6">
                    <h3 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4">Schnellaktionen</h3>
                    <div className="space-y-3">
                        <button className="md-button md-button--filled w-full justify-start">
                            <Plus className="w-4 h-4 mr-2" />
                            Neues Angebot erstellen
                        </button>
                        <button className="md-button md-button--outlined w-full justify-start">
                            <Target className="w-4 h-4 mr-2" />
                            Angebote durchsuchen
                        </button>
                        <button className="md-button md-button--outlined w-full justify-start">
                            <Mail className="w-4 h-4 mr-2" />
                            Anfragen anzeigen
                        </button>
                    </div>
                </div>

                <div className="md-card md-card--elevated p-6">
                    <h3 className="text-lg font-semibold text-[var(--md-on-surface)] mb-4">Aktuelle Aktivitäten</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-[var(--md-surface-container-high)] rounded-lg">
                            <div className="w-2 h-2 bg-[var(--md-success)] rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm text-[var(--md-on-surface)]">Neues Match gefunden</p>
                                <p className="text-xs text-[var(--md-on-surface-variant)]">vor 2 Stunden</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-[var(--md-surface-container-high)] rounded-lg">
                            <div className="w-2 h-2 bg-[var(--md-primary)] rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm text-[var(--md-on-surface)]">Bewerbung erhalten</p>
                                <p className="text-xs text-[var(--md-on-surface-variant)]">vor 4 Stunden</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-[var(--md-surface-container-high)] rounded-lg">
                            <div className="w-2 h-2 bg-[var(--md-tertiary)] rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm text-[var(--md-on-surface)]">Angebot veröffentlicht</p>
                                <p className="text-xs text-[var(--md-on-surface-variant)]">vor 1 Tag</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Offers */}
            <div className="md-card md-card--elevated p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--md-on-surface)]">Neueste Angebote</h3>
                    <button className="md-button md-button--text">
                        Alle anzeigen
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[var(--md-surface-container-high)] rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--md-primary-container)] rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-[var(--md-on-primary-container)]" />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--md-on-surface)]">Bankkonto eröffnen</p>
                                <p className="text-sm text-[var(--md-on-surface-variant)]">Sparkasse München</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-[var(--md-on-surface)]">€50,00</p>
                            <p className="text-sm text-[var(--md-on-surface-variant)]">vor 2 Stunden</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--md-surface-container-high)] rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--md-secondary-container)] rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-[var(--md-on-secondary-container)]" />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--md-on-surface)]">Zeitungsabo</p>
                                <p className="text-sm text-[var(--md-on-surface-variant)]">Süddeutsche Zeitung</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-[var(--md-on-surface)]">€25,00</p>
                            <p className="text-sm text-[var(--md-on-surface-variant)]">vor 5 Stunden</p>
                        </div>
                    </div>
                </div>
            </div>
        </ModernLayout>
    );
}
