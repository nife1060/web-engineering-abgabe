import Link from "next/link";
import { redirect } from "next/navigation";
import CertificatePrintButton from "@/components/CertificatePrintButton";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

const printStyles = `
@media print {
  body { background: #ffffff !important; }
  .no-print { display: none !important; }
  main { margin: 0 !important; padding: 0 !important; }
  .certificate-page { background: #ffffff !important; padding: 0 !important; min-height: 0 !important; }
  .certificate-sheet {
    box-shadow: none !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: none !important;
  }
  @page { size: A4 landscape; margin: 0; }
}
`;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function CertificatePage({ params }: Props) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      course: {
        include: { creator: { select: { name: true } } },
      },
    },
  });

  if (!certificate) {
    redirect("/mylearning?tab=certifications");
  }

  // Only the certificate holder (or an admin) may view it.
  if (certificate.userId !== session.userId && session.role !== "ADMIN") {
    redirect("/mylearning?tab=certifications");
  }

  const issuedOn = formatDate(certificate.issuedAt);

  return (
    <div className="certificate-page min-h-[calc(100vh-64px)] bg-gray-100 py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="mx-auto max-w-[1123px] px-4">
        <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/mylearning?tab=certifications"
            className="text-sm font-semibold text-purple-600 hover:text-purple-800"
          >
            ← Back to My Learning
          </Link>
          <CertificatePrintButton label="Print / Download PDF" />
        </div>

        <div className="certificate-sheet relative mx-auto w-full overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Decorative frame */}
          <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-purple-200" />
          <div className="pointer-events-none absolute inset-5 rounded-lg border border-amber-300/70" />
          <span className="pointer-events-none absolute left-0 top-0 h-28 w-28 rounded-br-[100%] bg-purple-600/10" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-tl-[100%] bg-amber-400/10" />

          <div className="relative flex flex-col items-center px-10 py-14 text-center sm:px-20 sm:py-20">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-lg font-extrabold text-white">
                L
              </span>
              <span className="text-2xl font-bold tracking-tight text-gray-900">Learnify</span>
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-amber-500">
              Certificate of Completion
            </p>
            <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-purple-500 to-amber-400" />

            <p className="mt-10 text-sm font-medium text-gray-500">This certifies that</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              {certificate.user.name}
            </h1>

            <p className="mt-8 max-w-2xl text-sm font-medium text-gray-500">
              has successfully completed the course
            </p>
            <h2 className="mt-3 max-w-3xl text-2xl font-bold text-purple-700 sm:text-3xl">
              {certificate.course.title}
            </h2>

            <div className="mt-14 flex w-full max-w-2xl flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
              <div className="text-center sm:text-left">
                <p className="border-t border-gray-300 pt-2 text-sm font-bold text-gray-900">
                  {certificate.course.creator.name}
                </p>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="border-t border-gray-300 pt-2 text-sm font-bold text-gray-900">
                  {issuedOn}
                </p>
                <p className="text-xs text-gray-500">Date of completion</p>
              </div>
            </div>

            <p className="mt-12 text-[11px] font-medium uppercase tracking-widest text-gray-400">
              Certificate ID: {certificate.serial}
            </p>
          </div>
        </div>

        <p className="no-print mt-6 text-center text-xs text-gray-400">
          Use your browser&apos;s print dialog and choose &quot;Save as PDF&quot; to download this certificate.
        </p>
      </div>
    </div>
  );
}
