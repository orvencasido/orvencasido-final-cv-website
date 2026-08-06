import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { getProfile, getProjects, getBlogs, getSkills } from '../../lib/services';
import { Profile, Project, Blog, Skill } from '../../types';
import { LoadingSkeleton } from '../../components/ui/CommonUI';
import { getTechIconUrl } from '../../lib/techIcons';

export const HomePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [profData, projData, blogData, skillData] = await Promise.all([
          getProfile(),
          getProjects(),
          getBlogs(),
          getSkills(),
        ]);

        setProfile(profData);
        setFeaturedProjects(projData.filter((p) => p.is_featured).slice(0, 2));
        setFeaturedBlogs(blogData.filter((b) => b.is_featured && b.status === 'published').slice(0, 2));
        setSkills(skillData.filter((s) => s.is_visible));
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  if (loading || !profile) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  const initials = profile.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'OC';

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. Hero Section (Warm Beige Base) */}
      <section className="w-full bg-beige-100 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left Column */}
          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-matcha-950 leading-[1.1]">
                {profile.full_name}
              </h1>
              <p className="text-2xl sm:text-3xl text-matcha-700 font-medium">
                {profile.professional_title}
              </p>
            </div>

            <p className="text-matcha-800 text-lg sm:text-xl max-w-2xl leading-relaxed font-normal">
              {profile.introduction}
            </p>

            {/* Tech Stack */}
            <div className="pt-4 space-y-4">
              <h3 className="text-xs font-extrabold text-matcha-700 uppercase tracking-widest">
                Tech Stack & Expertise
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                {skills
                  .filter((s) => s && s.name && s.name.trim().length > 0 && s.name !== ',')
                  .map((skill) => {
                    const iconUrl = getTechIconUrl(skill);
                    return (
                      <div
                        key={skill.id}
                        className="relative group/tech flex items-center justify-center p-1.5 cursor-pointer transition-all duration-200"
                      >
                        <img
                          src={iconUrl}
                          alt={skill.name}
                          className="w-7 h-7 sm:w-8 sm:h-8 object-contain select-none opacity-40 group-hover/tech:opacity-100 group-hover/tech:scale-110 transition-all duration-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const parent = (e.currentTarget as HTMLElement).parentElement;
                            if (parent && !parent.querySelector('.fallback-text')) {
                              const span = document.createElement('span');
                              span.className =
                                'fallback-text text-xs font-bold font-mono text-matcha-900 opacity-40 group-hover/tech:opacity-100 transition-all duration-200';
                              span.innerText = skill.name;
                              parent.appendChild(span);
                            }
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2.5 hidden group-hover/tech:flex flex-col items-center pointer-events-none z-30">
                          <span className="px-3 py-1 bg-matcha-950 text-beige-50 text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap">
                            {skill.name}
                          </span>
                          <span className="w-2 h-2 bg-matcha-950 rotate-45 -mt-1"></span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Column: Avatar */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[360px] lg:h-[360px] rounded-full overflow-hidden flex items-center justify-center shadow-xl transition-transform hover:scale-[1.02]">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-matcha-900 text-beige-50 font-bold text-6xl">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Projects Section (White Pastel Background) */}
      <section className="w-full bg-white border-y border-beige-200/80 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-beige-200 pb-6 gap-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold font-mono tracking-[0.2em] text-amber-700 uppercase">
                Always Building
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-matcha-950">
                Shipped Projects
              </h2>
            </div>
            <Link
              to="/projects"
              className="text-sm font-bold text-matcha-700 hover:text-matcha-950 flex items-center gap-1.5 group transition-colors"
            >
              <span>View all projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {featuredProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-beige-50 border border-beige-200 rounded-3xl p-8 shadow-2xs hover:shadow-md hover:border-matcha-400 group flex flex-col justify-between transition-all space-y-6"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-matcha-100 text-matcha-900 rounded-2xl flex items-center justify-center group-hover:bg-matcha-900 group-hover:text-beige-50 transition-colors shadow-2xs">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-xl sm:text-2xl text-matcha-950 group-hover:text-matcha-700 transition-colors">
                    <Link to={`/projects/${proj.slug}`}>{proj.title}</Link>
                  </h3>
                  <p className="text-sm sm:text-base text-matcha-700 line-clamp-3 leading-relaxed font-normal">
                    {proj.short_description}
                  </p>
                </div>

                <div className="pt-4 border-t border-beige-200 flex items-center gap-2 flex-wrap">
                  {proj.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-bold text-matcha-900 uppercase tracking-wider bg-matcha-100/70 px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner Section */}
          <div className="bg-matcha-900 text-beige-50 border border-matcha-800 rounded-3xl p-10 md:p-14 flex flex-col justify-center relative overflow-hidden shadow-xl mt-12">
            <div className="relative z-10 max-w-xl space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-beige-50 tracking-tight leading-tight">
                Let's build something extraordinary together.
              </h2>
              <p className="text-matcha-200 text-base sm:text-lg leading-relaxed font-normal pb-2">
                I am open for software engineering opportunities, consulting, and building high-impact platforms.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/contact"
                  className="px-8 py-3.5 bg-beige-50 text-matcha-950 font-bold text-sm rounded-full hover:bg-beige-200 transition shadow-md"
                >
                  Get In Touch
                </Link>
                <a
                  href={`mailto:${profile.email}`}
                  className="px-8 py-3.5 border border-matcha-600 text-matcha-100 font-bold text-sm rounded-full hover:bg-matcha-800 transition"
                >
                  Send Email
                </a>
              </div>
            </div>
            {/* Background Chevron Graphic */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-8 pointer-events-none hidden sm:block opacity-15">
              <ChevronRight className="w-80 h-80 text-beige-50 stroke-[1.5]" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Writing Section (Warm Beige Base) */}
      <section className="w-full bg-beige-100 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-beige-300 pb-6 gap-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold font-mono tracking-[0.2em] text-amber-700 uppercase">
                Engineering Higlights
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-matcha-950">
                Latest Articles & Insights
              </h2>
            </div>
            <Link
              to="/blogs"
              className="text-sm font-bold text-matcha-700 hover:text-matcha-950 flex items-center gap-1.5 group transition-colors"
            >
              <span>Read all articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="p-8 bg-white border border-beige-300 rounded-3xl shadow-2xs hover:border-matcha-400 hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-matcha-600 font-mono font-medium">
                    <span>{blog.published_at}</span>
                    <span>{blog.reading_time}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-matcha-950 hover:text-matcha-700 transition-colors">
                    <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  <p className="text-sm sm:text-base text-matcha-700 line-clamp-3 leading-relaxed font-normal">
                    {blog.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-beige-200">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-matcha-100 text-matcha-900 border border-matcha-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="text-sm font-extrabold text-matcha-800 hover:text-matcha-950 flex items-center gap-1"
                  >
                    Read &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
