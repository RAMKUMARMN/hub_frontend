import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Your profile page is available. Add your profile UI here.
        </p>
        <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-full bg-cixio-blue text-white hover:bg-cixio-navy transition">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
