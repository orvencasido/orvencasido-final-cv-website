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
        // Sort from newest to oldest by start_date or sort_order
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <SectionHeader
        title="Professional Experience"
        description="A timeline of engineering positions, cloud architecture achievements, and platform operations."
      />

      {experiences.length === 0 ? (
        <EmptyState title="No experience records found" />
      ) : (
        <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 sm:ml-6 space-y-12">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative pl-6 sm:pl-8 group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-900 dark:bg-zinc-100 group-hover:scale-125 transition-transform" />

              <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 space-y-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {exp.position}
                      </h2>
                      {exp.is_current && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Current Role
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-zinc-400" /> {exp.company}
                      <span className="text-xs text-zinc-400">({exp.employment_type})</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1 text-xs text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <MapPin className="w-3.5 h-3.5" /> {exp.location}
                    </span>
                  </div>
                </div>

                {/* Job Description */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {exp.description}
                </p>

                {/* Key Responsibilities */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-1.5">
                      {exp.responsibilities.map((resp, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Major Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Key Impact & Achievements
                    </h3>
                    <ul className="space-y-1">
                      {exp.achievements.map((ach, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200"
                        >
                          • {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
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
