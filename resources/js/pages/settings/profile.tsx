import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Mail, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ModernLayout from '@/layouts/ModernLayout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Einstellungen',
        href: '/settings/profile',
    },
    {
        title: 'Profil',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <ModernLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil-Einstellungen" />

            <div className="space-y-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--md-on-surface)] mb-2">
                        Profil-Einstellungen
                    </h1>
                    <p className="text-[var(--md-on-surface-variant)]">
                        Verwalte deine persönlichen Informationen und Einstellungen.
                    </p>
                </div>

                {/* Profile Information Card */}
                <div className="md-card md-card--elevated p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-[var(--md-primary-container)] rounded-lg">
                            <User className="w-6 h-6 text-[var(--md-on-primary-container)]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--md-on-surface)]">
                                Profil-Informationen
                            </h2>
                            <p className="text-[var(--md-on-surface-variant)]">
                                Aktualisiere deinen Namen und deine E-Mail-Adresse
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="md-label">Name</Label>
                                <Input
                                    id="name"
                                    className="md-input"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Vollständiger Name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="md-label">E-Mail-Adresse</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="md-input"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="E-Mail-Adresse"
                                />
                                <InputError message={errors.email} />
                            </div>
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div className="p-4 bg-[var(--md-error-container)] rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-[var(--md-on-error-container)] mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm text-[var(--md-on-error-container)] mb-2">
                                            Deine E-Mail-Adresse ist nicht verifiziert.
                                        </p>
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="text-sm text-[var(--md-on-error-container)] underline hover:no-underline"
                                        >
                                            Hier klicken, um die Verifizierungs-E-Mail erneut zu senden.
                                        </Link>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-3 p-3 bg-[var(--md-success-container)] rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[var(--md-on-success-container)]" />
                                                    <p className="text-sm text-[var(--md-on-success-container)]">
                                                        Ein neuer Verifizierungslink wurde an deine E-Mail-Adresse gesendet.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                disabled={processing}
                                className="md-button md-button--filled"
                            >
                                {processing ? 'Speichern...' : 'Speichern'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <div className="flex items-center gap-2 text-[var(--md-success)]">
                                    <CheckCircle className="w-4 h-4" />
                                    <p className="text-sm font-medium">Gespeichert</p>
                                </div>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* Delete Account Card */}
                <div className="md-card md-card--elevated p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-[var(--md-error-container)] rounded-lg">
                            <Trash2 className="w-6 h-6 text-[var(--md-on-error-container)]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--md-on-surface)]">
                                Account löschen
                            </h2>
                            <p className="text-[var(--md-on-surface-variant)]">
                                Lösche deinen Account dauerhaft
                            </p>
                        </div>
                    </div>

                    <DeleteUser />
                </div>
            </div>
        </ModernLayout>
    );
}
