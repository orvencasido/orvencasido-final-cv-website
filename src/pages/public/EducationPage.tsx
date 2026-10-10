import React, { useEffect, useState } from 'react';
import { GraduationCap, MapPin, Calendar, Award, BookOpen, Users } from 'lucide-react';
import { getEducation } from '../../lib/services';
import { Education } from '../../types';
import { SectionHeader, EmptyState } from '../../components/ui/CommonUI';
import { TimelineSkeleton } from '../../components/ui/ShimmerSkeleton';
import { SEOHead } from '../../seo/SEOHead';
import { PAGE_SEO_CONFIG } from '../../seo/seoConfig';

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12">
        <SectionHeader
          title="Education"
          description="Academic background and foundational studies in computer science and software systems."
        />
        <TimelineSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      <SEOHead {...PAGE_SEO_CONFIG.education} />

      <SectionHeader
        title="Education"
        description="Academic background and foundational studies in computer science and software systems."
      />

      {educationList.length === 0 ? (
        <EmptyState title="No education records found" />
      ) : (
        <div className="space-y-8 sm:space-y-10">
          {educationList.map((edu) => (
            <div
              key={edu.id}
              className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 space-y-6 sm:space-y-8 shadow-xs hover:border-matcha-300 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-beige-200 pb-4 sm:pb-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-matcha-950 flex items-start sm:items-center gap-2.5 sm:gap-3 break-words">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-matcha-600 shrink-0 mt-0.5 sm:mt-0" />
                    <span>{edu.degree} in {edu.field_of_study}</span>
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-matcha-800">
                    {edu.school}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-matcha-700 font-mono gap-1">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-matcha-600 shrink-0" /> {edu.start_date} — {edu.end_date}
                  </span>
                  <span className="flex items-center gap-1.5 text-matcha-600">
                    <MapPin className="w-3.5 h-3.5 text-matcha-600 shrink-0" /> {edu.location}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-matcha-800 leading-relaxed font-normal">
                {edu.description}
              </p>

              {/* Coursework */}
              {edu.coursework && edu.coursework.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-matcha-800 flex items-center gap-2 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-matcha-600 shrink-0" /> Key Coursework
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                  <h3 className="text-xs font-semibold text-matcha-900 flex items-center gap-2 uppercase tracking-wider">
                    <Award className="w-4 h-4 text-matcha-600 shrink-0" /> Awards & Academic Honors
                  </h3>
                  <ul className="space-y-2">
                    {edu.awards.map((award, i) => (
                      <li key={i} className="text-xs sm:text-sm md:text-base font-semibold text-matcha-950">
                        • {award}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Activities */}
              {edu.activities && edu.activities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-matcha-800 flex items-center gap-2 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-matcha-600 shrink-0" /> Campus Involvement
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {edu.activities.map((act) => (
                      <span
                        key={act}
                        className="text-xs sm:text-sm font-semibold text-matcha-900 bg-beige-200/50 px-3.5 py-1.5 rounded-full border border-beige-200"
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
