import React, { useEffect, useState } from 'react';
import { GraduationCap, MapPin, Calendar, Award, BookOpen, Users } from 'lucide-react';
import { getEducation } from '../../lib/services';
import { Education } from '../../types';
import { SectionHeader, LoadingSkeleton, EmptyState } from '../../components/ui/CommonUI';

export const EducationPage: React.FC = () => {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEducation() {
      try {
        const data = await getEducation();
        setEducationList(data);
      } catch (err) {
        console.error('Error fetching education:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEducation();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <SectionHeader
        title="Education & Academic Background"
        description="Degrees, academic honors, specialized coursework, and university engineering involvement."
      />

      {educationList.length === 0 ? (
        <EmptyState title="No education records found" />
      ) : (
        <div className="space-y-8">
          {educationList.map((edu) => (
            <div
              key={edu.id}
              className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 space-y-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    {edu.degree} in {edu.field_of_study}
                  </h2>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {edu.school}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-zinc-500 font-mono gap-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {edu.start_date} — {edu.end_date}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5" /> {edu.location}
                  </span>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {edu.description}
              </p>

              {/* Coursework */}
              {edu.coursework && edu.coursework.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Key Coursework
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {edu.coursework.map((course) => (
                      <span
                        key={course}
                        className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {edu.awards && edu.awards.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Awards & Honors
                  </h3>
                  <ul className="space-y-1">
                    {edu.awards.map((award, i) => (
                      <li key={i} className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                        • {award}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Activities */}
              {edu.activities && edu.activities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Campus Activities & Societies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {edu.activities.map((act) => (
                      <span
                        key={act}
                        className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                      >
                        • {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
