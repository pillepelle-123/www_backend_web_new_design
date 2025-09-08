import ModernLayout from '@/layouts/ModernLayout';
import { Head } from '@inertiajs/react';
import {
  TrendingUp,
  Users,
  Euro,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target
} from 'lucide-react';

export default function ModernDashboard() {
  const stats = [
    {
      title: 'Gesamte Prämien',
      value: '€2,450',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Euro,
    },
    {
      title: 'Aktive Matches',
      value: '8',
      change: '+2',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Durchschnittsbewertung',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive' as const,
      icon: Star,
    },
    {
      title: 'Erfolgsrate',
      value: '94%',
      change: '+3%',
      changeType: 'positive' as const,
      icon: Target,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'match',
      title: 'Neues Match gefunden',
      description: 'Du wurdest mit einem Angebot von Apple Deutschland gematcht',
      time: 'vor 2 Stunden',
      icon: Users,
    },
    {
      id: 2,
      type: 'reward',
      title: 'Prämie erhalten',
      description: '€150 Prämie von Commerzbank wurde ausgezahlt',
      time: 'vor 1 Tag',
      icon: Euro,
    },
    {
      id: 3,
      type: 'rating',
      title: 'Neue Bewertung',
      description: 'Du hast eine 5-Sterne Bewertung erhalten',
      time: 'vor 2 Tagen',
      icon: Star,
    },
  ];

  return (
    <ModernLayout>
      <Head title="Dashboard" />

      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[var(--md-primary)] to-[var(--md-secondary)] rounded-2xl p-8 text-[var(--md-on-primary)]">
          <h1 className="text-3xl font-bold mb-2">
            Willkommen zurück! 👋
          </h1>
          <p className="text-[var(--md-on-primary)]/80 text-lg">
            Hier ist eine Übersicht über deine Aktivitäten und Erfolge.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="md-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-[var(--md-primary-container)]">
                    <IconComponent className="w-6 h-6 text-[var(--md-on-primary-container)]" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-[var(--md-success)]' : 'text-[var(--md-error)]'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--md-on-surface)] mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-[var(--md-on-surface-variant)] text-sm">
                    {stat.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="md-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--md-on-surface)]">
                  Letzte Aktivitäten
                </h2>
                <button className="text-[var(--md-primary)] hover:text-[var(--md-primary-container)] transition-colors text-sm font-medium">
                  Alle anzeigen
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-[var(--md-surface-container)] transition-colors">
                      <div className="p-2 rounded-lg bg-[var(--md-surface-container-high)]">
                        <IconComponent className="w-5 h-5 text-[var(--md-on-surface-variant)]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--md-on-surface)] mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-[var(--md-on-surface-variant)] text-sm mb-2">
                          {activity.description}
                        </p>
                        <span className="text-xs text-[var(--md-on-surface-variant)]">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="md-card p-6">
              <h2 className="text-xl font-semibold text-[var(--md-on-surface)] mb-6">
                Schnellaktionen
              </h2>

              <div className="space-y-3">
                <button className="w-full md-button md-button--filled justify-start">
                  <TrendingUp className="w-5 h-5" />
                  Neues Angebot erstellen
                </button>
                <button className="w-full md-button md-button--outlined justify-start">
                  <Users className="w-5 h-5" />
                  Matches anzeigen
                </button>
                <button className="w-full md-button md-button--outlined justify-start">
                  <Activity className="w-5 h-5" />
                  Aktivitäten verfolgen
                </button>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="md-card p-6">
              <h2 className="text-xl font-semibold text-[var(--md-on-surface)] mb-6">
                Performance
              </h2>

              <div className="h-48 bg-[var(--md-surface-container)] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-[var(--md-on-surface-variant)] mx-auto mb-2" />
                  <p className="text-[var(--md-on-surface-variant)] text-sm">
                    Chart wird geladen...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
