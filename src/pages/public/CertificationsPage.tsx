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
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12">
      <SectionHeader
        title="Achievements Somehow?"
        description="Technology never stands still, and neither do I. These training certificates represent my commitment to continuous growth, with more certifications to come."
      />

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
                className="p-8 rounded-3xl border border-beige-300 bg-beige-50 flex flex-col justify-between space-y-6 hover:border-matcha-400 hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-matcha-100 flex items-center justify-center text-matcha-900 shrink-0">
                      <Award className="w-6 h-6" />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${isExpired
                        ? 'bg-beige-200 text-matcha-800 border border-beige-300'
                        : 'bg-matcha-900 text-beige-50'
                        }`}
                    >
                      {isExpired ? (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" /> Expired
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Credential
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-matcha-950">
                      {cert.name}
                    </h2>
                    <p className="text-sm font-bold text-matcha-700">
                      {cert.issuing_organization}
                    </p>
                  </div>

                  <p className="text-sm text-matcha-800 leading-relaxed font-normal">
                    {cert.description}
                  </p>

                  <div className="text-xs text-matcha-600 font-mono space-y-1 pt-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-matcha-600" /> Issued: {cert.issue_date}{' '}
                      {cert.expiration_date ? `| Expires: ${cert.expiration_date}` : '| No Expiry'}
                    </div>
                    {cert.credential_id && (
                      <div className="pt-1 font-semibold text-matcha-900">
                        ID: <span>{cert.credential_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-beige-200">
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-matcha-100 text-matcha-950 border border-matcha-200"
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
                      className="inline-flex items-center gap-2 text-sm font-extrabold text-matcha-900 hover:text-matcha-700"
                    >
                      Verify Credential <ExternalLink className="w-4 h-4" />
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
