import React, { useEffect, useState } from 'react';
import { Briefcase, MapPin, Calendar, CheckCircle, Award } from 'lucide-react';
import { getExperiences } from '../../lib/services';
import { Experience } from '../../types';
import { SectionHeader, EmptyState } from '../../components/ui/CommonUI';
import { TimelineSkeleton } from '../../components/ui/ShimmerSkeleton';
import { SEOHead } from '../../seo/SEOHead';
import { PAGE_SEO_CONFIG } from '../../seo/seoConfig';

export const ExperiencePage: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExperiences() {
      try {
        const data = await getExperiences();
        setExperiences(data);
      } catch (err) {
        console.error('Error fetching experiences:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExperiences();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12">
        <SectionHeader
          title="Experience"
          description="Career history and milestones across DevOps, cloud infrastructure, and systems architecture."
        />
        <TimelineSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      <SEOHead {...PAGE_SEO_CONFIG.experience} />

      <SectionHeader
        title="Experience"
        description="Career history and milestones across DevOps, cloud infrastructure, and systems architecture."
      />

      {experiences.length === 0 ? (
        <EmptyState title="No experience records found" />
      ) : (
        <div className="relative border-l-2 border-beige-200 ml-2 sm:ml-6 md:ml-8 space-y-10 sm:space-y-14">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative pl-4 sm:pl-8 md:pl-12 group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full border-2 border-beige-100 bg-matcha-900 group-hover:scale-125 transition-transform" />

              <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 space-y-6 sm:space-y-8 shadow-xs hover:border-matcha-300 hover:shadow-md transition-all">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-beige-200 pb-4 sm:pb-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-matcha-950 break-words">
                        {exp.position}
                      </h2>
                      {exp.is_current && (
                        <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-matcha-900 text-beige-50">
                          Current Role
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-bold text-matcha-800 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-matcha-600 shrink-0" />
                      <span>{exp.company}</span>
                      <span className="text-xs text-matcha-600 font-normal">({exp.employment_type})</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1 text-xs text-matcha-700 font-mono">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-matcha-600 shrink-0" />
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                    </span>
                    <span className="flex items-center gap-1.5 text-matcha-600">
                      <MapPin className="w-3.5 h-3.5 text-matcha-600 shrink-0" /> {exp.location}
                    </span>
                  </div>
                </div>

                {/* Job Description */}
                <p className="text-sm sm:text-base text-matcha-800 leading-relaxed font-normal">
                  {exp.description}
                </p>

                {/* Key Responsibilities */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-matcha-800 uppercase tracking-wider">
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((resp, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-sm md:text-base text-matcha-800 flex items-start gap-2.5 sm:gap-3"
                        >
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-matcha-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Major Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-beige-200">
                    <h3 className="text-xs font-semibold text-matcha-900 flex items-center gap-2 uppercase tracking-wider">
                      <Award className="w-4 h-4 text-matcha-600 shrink-0" /> Key Impact & Achievements
                    </h3>
                    <ul className="space-y-2">
                      {exp.achievements.map((ach, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-sm md:text-base font-semibold text-matcha-950"
                        >
                          • {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-matcha-100 text-matcha-950 border border-matcha-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
