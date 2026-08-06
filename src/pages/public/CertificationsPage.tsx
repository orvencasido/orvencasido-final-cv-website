import React, { useEffect, useState } from 'react';
import { Award, ExternalLink, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getCertifications } from '../../lib/services';
import { Certification } from '../../types';
import { LoadingSkeleton, EmptyState } from '../../components/ui/CommonUI';

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
      <div className="max-w-4xl mx-auto px-6 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <p className="eyebrow mb-3">Accreditations</p>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink">
          Certifications & Credentials
        </h1>
        <p className="mt-4 text-base text-muted max-w-2xl leading-relaxed">
          Official platform credentials, technical certifications, and verified skill achievements.
        </p>
      </div>

      {certifications.length === 0 ? (
        <EmptyState title="No certifications found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certifications.map((cert) => {
            const isExpired = cert.expiration_date
              ? new Date(cert.expiration_date) < new Date()
              : false;

            return (
              <div
                key={cert.id}
                className="p-7 rounded-3xl border border-line bg-card flex flex-col justify-between space-y-6 hover:border-copper/40 transition-all shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-paper border border-line flex items-center justify-center text-copper shrink-0">
                      <Award className="w-5 h-5" />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                        isExpired
                          ? 'bg-amber-500/10 text-copper border-copper/30'
                          : 'bg-copper/10 text-copper border-copper/30'
                      }`}
                    >
                      {isExpired ? (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" /> Expired
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {cert.name}
                    </h2>
                    <p className="text-xs font-medium text-muted">
                      {cert.issuing_organization}
                    </p>
                  </div>

                  <p className="text-sm text-muted leading-relaxed">
                    {cert.description}
                  </p>

                  <div className="text-xs text-muted-subtle space-y-1 pt-1 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-copper" /> Issued: {cert.issue_date}{' '}
                      {cert.expiration_date ? `| Expires: ${cert.expiration_date}` : '| No Expiry'}
                    </div>
                    {cert.credential_id && (
                      <div>
                        Credential ID: <span className="text-ink font-mono">{cert.credential_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-line">
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-paper text-muted border border-line"
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
                      className="inline-flex items-center gap-1 text-xs font-semibold text-copper hover:underline"
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
