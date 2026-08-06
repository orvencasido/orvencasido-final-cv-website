import React, { useEffect, useState } from 'react';
import { GraduationCap, MapPin, Calendar, Award, BookOpen, Users } from 'lucide-react';
import { getEducation } from '../../lib/services';
import { Education } from '../../types';
import { LoadingSkeleton, EmptyState } from '../../components/ui/CommonUI';

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
      <div className="max-w-4xl mx-auto px-6 py-16">
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <p className="eyebrow mb-3">Background</p>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink">
          Education & Academic Background
        </h1>
        <p className="mt-4 text-base text-muted max-w-2xl leading-relaxed">
          Degrees, specialized coursework, honors, and technical leadership involvement.
        </p>
      </div>

      {educationList.length === 0 ? (
        <EmptyState title="No education records found" />
      ) : (
        <div className="space-y-8">
          {educationList.map((edu) => (
            <div
              key={edu.id}
              className="p-7 sm:p-8 rounded-3xl border border-line bg-card space-y-6 shadow-xs hover:border-copper/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                <div className="space-y-1">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <GraduationCap className="w-5 h-5 text-copper" />
                    {edu.degree} in {edu.field_of_study}
                  </h2>
                  <p className="text-sm font-medium text-muted">
                    {edu.school}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-muted font-medium gap-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-copper" /> {edu.start_date} — {edu.end_date}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-subtle">
                    <MapPin className="w-3.5 h-3.5" /> {edu.location}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted leading-relaxed">
                {edu.description}
              </p>

              {/* Coursework */}
              {edu.coursework && edu.coursework.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-copper flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Key Coursework
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {edu.coursework.map((course) => (
                      <span
                        key={course}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-paper text-muted border border-line"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {edu.awards && edu.awards.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-line">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-copper flex items-center gap-2">
                    <Award className="w-3.5 h-3.5" /> Honors & Awards
                  </h3>
                  <ul className="space-y-1.5">
                    {edu.awards.map((award, i) => (
                      <li key={i} className="text-xs sm:text-sm font-medium text-ink">
                        • {award}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Activities */}
              {edu.activities && edu.activities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-copper flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Campus Activities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {edu.activities.map((act) => (
                      <span
                        key={act}
                        className="text-xs font-medium text-muted"
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
