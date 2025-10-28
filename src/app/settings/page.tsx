/**
 * @fileoverview Settings route stub for CryptoPanel user preferences.
 * - Will host the form to update base currency and timezone via Supabase profiles.
 * - Currently acts as a placeholder until the settings feature is implemented.
 */
const SettingsPage = () => (
  <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
    <h1 className="text-2xl font-semibold">User Preferences</h1>
    <p className="max-w-md text-slate-300">
      The settings form for currency and timezone will be implemented after the Supabase integration
      and hooks are ready.
    </p>
  </main>
);

export default SettingsPage;
