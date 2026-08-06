import React, { useEffect, useState } from 'react';
import { Briefcase, MapPin, Calendar, CheckCircle, Award } from 'lucide-react';
import { getExperiences } from '../../lib/services';
import { Experience } from '../../types';
import { SectionHeader, LoadingSkeleton, EmptyState } from '../../components/ui/CommonUI';

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
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12">
      <SectionHeader
        title="My Journey, My Career"
        description="From internships to production environments—here's how I've grown as a DevOps and System Architect."
      />

      {experiences.length === 0 ? (
        <EmptyState title="No experience records found" />
      ) : (
        <div className="relative border-l-2 border-beige-300 ml-4 sm:ml-8 space-y-14">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative pl-8 sm:pl-12 group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-beige-100 bg-matcha-900 group-hover:scale-125 transition-transform" />

              <div className="p-8 sm:p-10 rounded-3xl border border-beige-300 bg-beige-50 space-y-8 shadow-xs hover:border-matcha-400 hover:shadow-md transition-all">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-beige-200 pb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-extrabold text-matcha-950">
                        {exp.position}
                      </h2>
                      {exp.is_current && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-matcha-900 text-beige-50">
                          Current Role
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold text-matcha-800 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-matcha-600" /> {exp.company}
                      <span className="text-xs text-matcha-600 font-normal">({exp.employment_type})</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5 text-xs text-matcha-700 font-mono">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Calendar className="w-4 h-4 text-matcha-600" />
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                    </span>
                    <span className="flex items-center gap-1.5 text-matcha-600">
                      <MapPin className="w-4 h-4" /> {exp.location}
                    </span>
                  </div>
                </div>

                {/* Job Description */}
                <p className="text-base text-matcha-800 leading-relaxed font-normal">
                  {exp.description}
                </p>

                {/* Key Responsibilities */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-matcha-700">
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-2.5">
                      {exp.responsibilities.map((resp, i) => (
                        <li
                          key={i}
                          className="text-sm sm:text-base text-matcha-800 flex items-start gap-3"
                        >
                          <CheckCircle className="w-5 h-5 text-matcha-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Major Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-beige-200">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-matcha-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-matcha-600" /> Key Impact & Achievements
                    </h3>
                    <ul className="space-y-2">
                      {exp.achievements.map((ach, i) => (
                        <li
                          key={i}
                          className="text-sm sm:text-base font-semibold text-matcha-950"
                        >
                          • {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
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
