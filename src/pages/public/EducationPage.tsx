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
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12">
      <SectionHeader
        title="I Studied Computers"
        description="Ever since I was young, I've been fascinated by technology. That curiosity led me to pursue a career in tech—and I'm just getting started."
      />

      {educationList.length === 0 ? (
        <EmptyState title="No education records found" />
      ) : (
        <div className="space-y-10">
          {educationList.map((edu) => (
            <div
              key={edu.id}
              className="p-8 sm:p-10 rounded-3xl border border-beige-300 bg-beige-50 space-y-8 shadow-xs hover:border-matcha-400 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-beige-200 pb-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-matcha-950 flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-matcha-600" />
                    <span>{edu.degree} in {edu.field_of_study}</span>
                  </h2>
                  <p className="text-base font-bold text-matcha-800">
                    {edu.school}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-matcha-700 font-mono gap-1.5">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-4 h-4 text-matcha-600" /> {edu.start_date} — {edu.end_date}
                  </span>
                  <span className="flex items-center gap-1.5 text-matcha-600">
                    <MapPin className="w-4 h-4" /> {edu.location}
                  </span>
                </div>
              </div>

              <p className="text-base text-matcha-800 leading-relaxed font-normal">
                {edu.description}
              </p>

              {/* Coursework */}
              {edu.coursework && edu.coursework.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-matcha-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Key Coursework
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {edu.coursework.map((course) => (
                      <span
                        key={course}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-matcha-100 text-matcha-950 border border-matcha-200"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {edu.awards && edu.awards.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-beige-200">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-matcha-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-matcha-600" /> Awards & Academic Honors
                  </h3>
                  <ul className="space-y-2">
                    {edu.awards.map((award, i) => (
                      <li key={i} className="text-sm sm:text-base font-semibold text-matcha-950">
                        • {award}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Activities */}
              {edu.activities && edu.activities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-matcha-700 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Campus Involvement
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {edu.activities.map((act) => (
                      <span
                        key={act}
                        className="text-sm font-semibold text-matcha-900 bg-beige-200/70 px-4 py-1.5 rounded-full border border-beige-300"
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
