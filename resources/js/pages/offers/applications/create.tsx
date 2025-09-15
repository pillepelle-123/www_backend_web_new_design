import ModernLayout from '@/layouts/ModernLayout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Offer } from '@/pages/offers';
import { Building2, UserRound, MessageSquare } from 'lucide-react';

const getBreadcrumbs = (offerId: number): BreadcrumbItem[] => [
  {
    title: 'Offers',
    href: '/offers',
  },
  {
    title: 'Details',
    href: `/offers/${offerId}`,
  },
  {
    title: 'Anfragen',
    href: '#',
  },
];

export default function Create({ offer, /* auth */ }: { offer: Offer, auth?: { user: { id: number, name: string } } }) {
  const { data, setData, post, processing, errors } = useForm({
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('web.applications.store', { offer_id: offer.id }), {
      preserveScroll: true,

    });
  };

  return (
    <ModernLayout breadcrumbs={getBreadcrumbs(offer.id)}>
      <Head title={`Anfrage für: ${offer.title}`} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--md-on-surface)]">
          Anfrage für: {offer.title}
        </h1>
      </div>

      {/* Offer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center gap-2 text-[var(--md-on-surface-variant)]">
          <UserRound className="w-5 h-5" />
          <span className="font-medium">Angebot von:</span>
          <span>{offer.offer_user}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--md-on-surface-variant)]">
          <Building2 className="w-5 h-5" />
          <span className="font-medium">Unternehmen:</span>
          <span>{offer.offer_company}</span>
        </div>
        {offer.offerer_type && (
          <div className="flex items-center gap-2 text-[var(--md-on-surface-variant)]">
            <span className="font-medium">Typ:</span>
            <span>{offer.offerer_type}</span>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mb-8">
        <div className="md-card md-card--elevated p-6">
          <p className="text-[var(--md-on-surface)] text-sm">
            Sie sind dabei, eine Anfrage für dieses Angebot zu stellen. Der Anbieter wird benachrichtigt und kann Ihre Anfrage annehmen oder ablehnen.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="md-card md-card--elevated p-6">

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="md-label">
              <MessageSquare className="w-4 h-4" />
              Nachricht an den Anbieter (optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="md-input"
              placeholder="Schreiben Sie hier Ihre Nachricht..."
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-[var(--md-error)]">{errors.message}</p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <a
              href={`/offers/${offer.id}`}
              className="md-button md-button--outlined"
            >
              Zurück
            </a>
            <button
              type="submit"
              disabled={processing}
              className="md-button md-button--filled"
            >
              {processing ? 'Wird gesendet...' : 'Anfrage senden'}
            </button>
          </div>
        </form>
      </div>
    </ModernLayout>
  );
}
