/**
 * "Certifications"-Tab auf der My-Learning-Seite: zeigt die bereits
 * verdienten Zertifikate und Kurse, die kurz vor dem Abschluss stehen.
 */

import Link from "next/link";

export type EarnedCertificate = {
  id: string;
  serial: string;
  courseTitle: string;
  instructor: string;
  issuedAt: string;
  thumbnail: string;
};

export type CertificateInProgressCourse = {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
};

function formatIssuedDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Eine Karte für ein verdientes Zertifikat, klickt man drauf kommt man zur Druckansicht. */
function CertificateCard({ certificate }: { certificate: EarnedCertificate }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md">
      <div className="relative h-32 overflow-hidden bg-gray-200">
        <img
          src={certificate.thumbnail}
          alt={certificate.courseTitle}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/95 px-2.5 py-1 text-[11px] font-extrabold text-amber-950">
          🏆 Certified
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-sm font-extrabold leading-snug text-gray-900 line-clamp-2">
          {certificate.courseTitle}
        </h3>
        <p className="mt-1 text-xs text-gray-500">{certificate.instructor}</p>
        <dl className="mt-4 space-y-1 text-xs text-gray-500">
          <div className="flex justify-between gap-2">
            <dt>Issued</dt>
            <dd className="font-semibold text-gray-700">{formatIssuedDate(certificate.issuedAt)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Certificate ID</dt>
            <dd className="font-mono text-[11px] font-semibold text-gray-700">{certificate.serial}</dd>
          </div>
        </dl>
        <Link
          href={`/certificates/${certificate.id}`}
          className="mt-5 block rounded-lg bg-purple-600 py-2.5 text-center text-xs font-bold text-white transition hover:bg-purple-700"
        >
          View &amp; Download PDF
        </Link>
      </div>
    </div>
  );
}

/** Karte für einen Kurs, der noch nicht ganz fertig ist, motiviert den Nutzer weiterzumachen. */
function InProgressCard({ course }: { course: CertificateInProgressCourse }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-extrabold leading-snug text-gray-900 line-clamp-2">{course.title}</h3>
      <p className="mt-1 text-xs text-gray-500">
        {course.completedLessons}/{course.totalLessons} lessons completed
      </p>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{course.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-purple-600" style={{ width: `${course.progress}%` }} />
        </div>
      </div>
      <Link
        href={`/learn/${course.id}`}
        className="mt-5 block rounded-lg border border-purple-600 py-2.5 text-center text-xs font-bold text-purple-600 transition hover:bg-purple-50"
      >
        Continue to earn certificate
      </Link>
    </div>
  );
}

export default function CertificationsSection({
  certificates,
  inProgressCourses,
}: {
  certificates: EarnedCertificate[];
  inProgressCourses: CertificateInProgressCourse[];
}) {
  return (
    <section className="space-y-12">
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-gray-900">Your Certificates</h2>
          <p className="mt-1 text-sm text-gray-500">
            Earn a certificate by completing every lesson in a course. Download or print it as a PDF.
          </p>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <h3 className="mb-2 text-lg font-bold text-gray-900">No certificates yet.</h3>
            <p className="text-sm text-gray-500">Complete a course to earn your first certificate.</p>
          </div>
        )}
      </div>

      {inProgressCourses.length > 0 ? (
        <div>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-gray-900">Almost there</h2>
            <p className="mt-1 text-sm text-gray-500">
              Finish these courses to unlock their certificates.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {inProgressCourses.map((course) => (
              <InProgressCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
