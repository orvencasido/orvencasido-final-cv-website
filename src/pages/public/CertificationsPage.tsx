import React, { useEffect, useState } from 'react';
import { Award, ExternalLink, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getCertifications } from '../../lib/services';
import { Certification } from '../../types';
import { SectionHeader, LoadingSkeleton, EmptyState } from '../../components/ui/CommonUI';

export const CertificationsPage: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCerts() {
      try {
        const data = await getCertifications();
        setCertifications(data);
      } catch (err) {
        console.error('Error fetching certifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <SectionHeader
        title="Certifications & Accreditations"
        description="Official cloud provider credentials, industry certifications, and verified technical competencies."
      />

      {certifications.length === 0 ? (
        <EmptyState title="No certifications found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert) => {
            const isExpired = cert.expiration_date
              ? new Date(cert.expiration_date) < new Date()
              : false;

            return (
              <div
                key={cert.id}
                className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-amber-500 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isExpired
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {isExpired ? (
                        <>
                          <ShieldAlert className="w-3 h-3" /> Expired
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {cert.name}
                    </h2>
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      {cert.issuing_organization}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {cert.description}
                  </p>

                  <div className="text-xs text-zinc-500 font-mono space-y-1 pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Issued: {cert.issue_date}{' '}
                      {cert.expiration_date ? `| Expires: ${cert.expiration_date}` : '| No Expiry'}
                    </div>
                    {cert.credential_id && (
                      <div>
                        ID: <span className="text-zinc-700 dark:text-zinc-300">{cert.credential_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                    >
                      Verify Credential <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
