import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { getProfile, getProjects, getBlogs, getSkills, getSocialLinks } from '../../lib/services';
import { Profile, Project, Blog, Skill, SocialLink } from '../../types';
import { StatusBadge, LoadingSkeleton } from '../../components/ui/CommonUI';
import { getTechIconUrl } from '../../lib/techIcons';

export const HomePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [profData, projData, blogData, skillData, socialData] = await Promise.all([
          getProfile(),
          getProjects(),
          getBlogs(),
          getSkills(),
          getSocialLinks(),
        ]);

        setProfile(profData);
        setFeaturedProjects(projData.filter((p) => p.is_featured).slice(0, 2));
        setFeaturedBlogs(blogData.filter((b) => b.is_featured && b.status === 'published').slice(0, 2));
        setSkills(skillData.filter((s) => s.is_visible));
        setSocials(socialData.filter((s) => s.is_visible));
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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-16 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-8rem)]">
      {/* Top Hero Landing Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-12 pt-4 pb-12 border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Left Column: Identity, Intro & Tech Stack */}
        <div className="flex-1 space-y-6 lg:space-y-8 w-full">
          <div className="space-y-1">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-slate-900 dark:text-slate-100">
              {profile.full_name}
            </h1>
            <p className="text-2xl sm:text-3xl text-slate-500 dark:text-slate-400 font-normal">
              {profile.professional_title}
            </p>
            <div className="pt-3">
              <StatusBadge status={profile.availability_status} type="availability" />
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            {profile.introduction}
          </p>

          <div className="pt-2 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              These are my Tech Stack
            </h3>
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              {skills
                .filter((s) => s && s.name && s.name.trim().length > 0 && s.name !== ',')
                .map((skill) => {
                  const iconUrl = getTechIconUrl(skill);
                  return (
                    <div
                      key={skill.id}
                      className="relative group/tech flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0 cursor-pointer"
                    >
                      <img
                        src={iconUrl}
                        alt={skill.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 object-contain select-none opacity-30 group-hover/tech:opacity-100 group-hover/tech:scale-110 transition-all duration-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                          const parent = (e.currentTarget as HTMLElement).parentElement;
                          if (parent && !parent.querySelector('.fallback-text')) {
                            const span = document.createElement('span');
                            span.className =
                              'fallback-text text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 opacity-30 group-hover/tech:opacity-100 transition-all duration-200';
                            span.innerText = skill.name;
                            parent.appendChild(span);
                          }
                        }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover/tech:flex flex-col items-center pointer-events-none z-30">
                        <span className="px-2.5 py-1 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[11px] font-bold rounded shadow-lg whitespace-nowrap">
                          {skill.name}
                        </span>
                        <span className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45 -mt-1"></span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Circular Avatar with Red Backdrop */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[360px] lg:h-[360px] rounded-full bg-[#c81127] dark:bg-[#a30b1e] overflow-hidden flex items-center justify-center shadow-xl transition-transform hover:scale-102">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.full_name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-6xl">
                {initials}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Featured Work
          </h2>
          <Link
            to="/projects"
            className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            View all projects &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {featuredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 group flex flex-col transition-all"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Link to={`/projects/${proj.slug}`}>{proj.title}</Link>
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {proj.short_description}
              </p>
              <div className="mt-auto pt-4 flex items-center gap-2 flex-wrap">
                {proj.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner Section */}
        <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 flex flex-col justify-center text-white relative overflow-hidden shadow-md mt-6">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
              Let's build something scalable.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mb-6 leading-relaxed">
              I'm currently seeking high-impact roles or specialized engineering opportunities in cloud architectures and modern full-stack web platforms.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="px-6 py-3 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition shadow-xs"
              >
                Start a Project
              </Link>
              <a
                href={`mailto:${profile.email}`}
                className="px-6 py-3 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800 transition"
              >
                Send Email
              </a>
            </div>
          </div>
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
            <Terminal className="w-56 h-56 text-white" />
          </div>
        </div>
      </section>

      {/* Featured Writing Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Latest Writing & Insights
          </h2>
          <Link
            to="/blogs"
            className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            Read all articles &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredBlogs.map((blog) => (
            <article
              key={blog.id}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{blog.published_at}</span>
                  <span>{blog.reading_time}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {blog.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/blogs/${blog.slug}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Read &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
