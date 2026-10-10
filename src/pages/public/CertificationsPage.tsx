import React, { useEffect, useState } from 'react';
import { Award, ExternalLink, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getCertifications } from '../../lib/services';
import { Certification } from '../../types';
import { SectionHeader, EmptyState } from '../../components/ui/CommonUI';
import { CertificationGridSkeleton } from '../../components/ui/ShimmerSkeleton';
import { SEOHead } from '../../seo/SEOHead';
import { PAGE_SEO_CONFIG } from '../../seo/seoConfig';

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12">
        <SectionHeader
          title="Certifications"
          description="Professional accreditations, certifications, and specialized technical training."
        />
        <CertificationGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      <SEOHead {...PAGE_SEO_CONFIG.certifications} />

      <SectionHeader
        title="Certifications"
        description="Professional accreditations, certifications, and specialized technical training."
      />

      {certifications.length === 0 ? (
        <EmptyState title="No certifications found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {certifications.map((cert) => {
            const isExpired = cert.expiration_date
              ? new Date(cert.expiration_date) < new Date()
              : false;

            return (
              <div
                key={cert.id}
                className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 flex flex-col justify-between space-y-5 sm:space-y-6 hover:border-matcha-300 hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-matcha-100 flex items-center justify-center text-matcha-900 shrink-0">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                        isExpired
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

                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-extrabold text-matcha-950 break-words">
                      {cert.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-matcha-700">
                      {cert.issuing_organization}
                    </p>
                  </div>

                  <p className="text-sm text-matcha-800 leading-relaxed font-normal">
                    {cert.description}
                  </p>

                  <div className="text-xs text-matcha-600 font-mono space-y-1 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-matcha-600 shrink-0" />
                      <span>Issued: {cert.issue_date}</span>
                      <span>{cert.expiration_date ? `| Expires: ${cert.expiration_date}` : '| No Expiry'}</span>
                    </div>
                    {cert.credential_id && (
                      <div className="pt-1 font-semibold text-matcha-900 break-all">
                        ID: <span>{cert.credential_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-beige-200">
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                      className="inline-flex items-center gap-2 text-sm font-semibold text-matcha-900 hover:text-matcha-700 min-h-[44px]"
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
