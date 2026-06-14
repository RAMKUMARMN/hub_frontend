import Image from "next/image";
import Link from "next/link";

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  footerText: string;
  footerHref: string;
  footerLink: string;
};

export default function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
  footerText,
  footerHref,
  footerLink,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-cixio-bg text-gray-900 dark:bg-[#071124] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="hidden border-r border-white/10 bg-cixio-dark px-10 py-10 text-white lg:flex lg:flex-col">
          <Link href="/chat" className="inline-flex w-fit items-center">
            <Image
              src="/cixio-logo-white.png"
              alt="Cixio"
              width={128}
              height={34}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          <div className="flex flex-1 items-center">
            <div className="max-w-md">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-cixio-light/70">
                {eyebrow}
              </p>
              <h1 className="text-4xl font-bold leading-tight">{title}</h1>
              <p className="mt-5 text-base leading-7 text-cixio-light/70">{subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm text-cixio-light/75">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-white">AI chat</p>
              <p className="mt-1 text-xs">Workspace ready</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-white">Documents</p>
              <p className="mt-1 text-xs">Knowledge central</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-white">Tasks</p>
              <p className="mt-1 text-xs">Daily flow</p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Image
                src="/cixio-logo.png"
                alt="Cixio"
                width={132}
                height={36}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>

            <div className="card-cixio rounded-lg p-6 shadow-xl shadow-cixio-dark/5 dark:border-white/10 dark:bg-[#0B1730] sm:p-8">
              {children}

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-cixio-light/65">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="font-semibold text-cixio-blue transition-colors hover:text-cixio-navy focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:ring-offset-2 dark:text-blue-300 dark:hover:text-white dark:focus:ring-offset-[#0B1730]"
                >
                  {footerLink}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
