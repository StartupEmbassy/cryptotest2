/**
 * @fileoverview 404 boundary for CryptoPanel routes.
 * - Provides consistent messaging for unknown URLs in the CSR application.
 */
const NotFoundPage = () => (
  <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
    <h1 className="text-3xl font-semibold text-red-300">Page not found</h1>
    <p className="max-w-md text-slate-300">
      The route you requested does not exist yet. Please return to the dashboard.
    </p>
  </main>
);

export default NotFoundPage;
