import React, { useEffect, useState } from 'react';
import { Briefcase, MapPin, Calendar, CheckCircle, Award } from 'lucide-react';
import { getExperiences } from '../../lib/services';
import { Experience } from '../../types';
import { LoadingSkeleton, EmptyState } from '../../components/ui/CommonUI';

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
      <div className="max-w-4xl mx-auto px-6 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <p className="eyebrow mb-3">Career Journey</p>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink">
          Professional Experience
        </h1>
        <p className="mt-4 text-base text-muted max-w-2xl leading-relaxed">
          A history of engineering roles, software development milestones, and production platform operations.
        </p>
      </div>

      {experiences.length === 0 ? (
        <EmptyState title="No experience records found" />
      ) : (
        <div className="relative border-l border-line ml-3 sm:ml-6 space-y-12">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative pl-6 sm:pl-8 group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-copper group-hover:scale-150 transition-transform" />

              <div className="p-7 sm:p-8 rounded-3xl border border-line bg-card space-y-6 shadow-xs hover:border-copper/40 transition-all">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-xl font-semibold text-ink">
                        {exp.position}
                      </h2>
                      {exp.is_current && (
                        <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-copper/10 text-copper border border-copper/30">
                          Current Role
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-copper" /> {exp.company}
                      <span className="text-xs text-muted-subtle">({exp.employment_type})</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1 text-xs text-muted font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-copper" />
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-subtle">
                      <MapPin className="w-3.5 h-3.5" /> {exp.location}
                    </span>
                  </div>
                </div>

                {/* Job Description */}
                <p className="text-sm text-muted leading-relaxed">
                  {exp.description}
                </p>

                {/* Key Responsibilities */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-copper">
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((resp, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-sm text-muted flex items-start gap-2.5"
                        >
                          <CheckCircle className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Major Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-line">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-copper flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Key Impact & Achievements
                    </h3>
                    <ul className="space-y-1.5">
                      {exp.achievements.map((ach, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-sm font-medium text-ink"
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
                        className="text-xs font-medium px-3 py-1 rounded-full bg-paper text-muted border border-line"
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
