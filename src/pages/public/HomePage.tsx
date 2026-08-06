import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { getProfile, getProjects, getBlogs, getSkills } from '../../lib/services';
import { Profile, Project, Blog, Skill } from '../../types';
import { StatusBadge, LoadingSkeleton } from '../../components/ui/CommonUI';
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
      <div className="max-w-6xl mx-auto px-6 py-16">
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

  const focusAreas = [
    {
      title: 'Full-Stack Web Engineering',
      description: 'Building modern, high-performance web platforms with React, TypeScript, and Node.js.',
    },
    {
      title: 'Cloud & Database Architecture',
      description: 'Designing scalable PostgreSQL schemas, serverless infrastructure, and cloud APIs.',
    },
    {
      title: 'UI/UX & Modern Design Systems',
      description: 'Crafting pixel-perfect, accessible interfaces with rich micro-animations and clean layouts.',
    },
    {
      title: 'API Engineering & Integrations',
      description: 'Developing secure REST and GraphQL endpoints backed by robust authentication & type safety.',
    },
    {
      title: 'Performance & Optimization',
      description: 'Auditing and optimizing load speeds, asset delivery, and bundle sizes for maximum throughput.',
    },
    {
      title: 'DevSecOps & CI/CD Pipelines',
      description: 'Automating testing, linting, and continuous deployments with GitHub Actions and Vercel.',
    },
  ];

  return (
    <div className="space-y-24">
      {/* 1. Hero Landing Section */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
          {/* Left Hero Content */}
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-3 mb-5">
              <p className="eyebrow">Full-Stack · Cloud · Web Architect</p>
              <StatusBadge status={profile.availability_status} type="availability" />
            </div>

            <h1 className="font-display font-semibold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.08] text-ink">
              Building resilient web systems, and the experiences behind them.
            </h1>

            <p className="mt-7 text-lg text-muted max-w-2xl leading-relaxed">
              I'm {profile.full_name}, a {profile.professional_title}. {profile.introduction}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/projects"
                className="px-6 py-3.5 rounded-full bg-[#111F24] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#111F24] text-sm font-semibold hover:bg-copper dark:hover:bg-copper dark:hover:text-white transition-colors"
              >
                View Featured Work
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-full border border-line-strong text-ink text-sm font-semibold hover:border-copper hover:text-copper transition-colors"
              >
                Get in touch
              </Link>
              <Link
                to="/blogs"
                className="px-6 py-3.5 rounded-full border border-line-strong text-ink text-sm font-semibold hover:border-copper hover:text-copper transition-colors"
              >
                Read the blog
              </Link>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="order-1 md:order-2 relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 shrink-0 mx-auto md:mx-0 rounded-3xl overflow-hidden border border-line shadow-sm bg-card flex items-center justify-center">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.full_name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-[#0F1D24] text-[#FAF8F5] flex items-center justify-center font-display font-bold text-6xl border border-copper/30">
                {initials}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Core Focus Areas ("What I Focus On") */}
      <section className="bg-card border-y border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-3">What I focus on</p>
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-ink mb-12 max-w-2xl">
            Core expertise across full-stack engineering, cloud, and database design
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusAreas.map((area, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-line bg-paper/60 hover:border-copper/40 transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-copper-gradient mb-4"></div>
                <h3 className="font-semibold text-ink mb-2 text-base">{area.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{area.description}</p>
              </div>
            ))}
          </div>

          {/* Tech Stack Icons Bar */}
          {skills.length > 0 && (
            <div className="mt-14 pt-10 border-t border-line">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-6">
                Technologies & Tools I Work With
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                {skills
                  .filter((s) => s && s.name && s.name.trim().length > 0)
                  .map((skill) => {
                    const iconUrl = getTechIconUrl(skill);
                    return (
                      <div
                        key={skill.id}
                        className="relative group/tech px-4 py-2.5 rounded-full border border-line bg-paper/80 hover:border-copper/60 transition-all flex items-center gap-2"
                      >
                        <img
                          src={iconUrl}
                          alt={skill.name}
                          className="w-5 h-5 object-contain select-none opacity-70 group-hover/tech:opacity-100 transition-opacity"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="text-xs font-medium text-ink">
                          {skill.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Dual Persona Callouts ("Who I Work With") */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-[#0F1D24] text-[#FAF8F5] border border-line">
            <h3 className="font-display font-semibold text-xl mb-3 text-white">
              For teams & engineering leads
            </h3>
            <p className="text-sm text-[#FAF8F5]/70 leading-relaxed">
              Delivering modular full-stack web solutions, clean REST/GraphQL microservices, and reliable database architectures with high test coverage and strict TypeScript safety.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-line bg-card">
            <h3 className="font-display font-semibold text-xl mb-3 text-ink">
              For founders & collaborators
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Transforming ambitious product ideas into production-ready web platforms, crafted with modern UX aesthetics, responsive layouts, and lightning-fast page speeds.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Featured Work Section */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="eyebrow mb-3">Portfolio</p>
            <h2 className="font-display font-semibold text-2xl md:text-3xl text-ink">
              Featured Work & Projects
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-sm font-semibold text-copper hover:underline flex items-center gap-1"
          >
            View all projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {featuredProjects.map((proj) => (
            <div
              key={proj.id}
              className="group block bg-card border border-line rounded-2xl p-7 hover:border-copper/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-paper border border-line text-copper flex items-center justify-center mb-5 group-hover:bg-copper group-hover:text-white transition-colors">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink group-hover:text-copper transition-colors">
                  <Link to={`/projects/${proj.slug}`}>{proj.title}</Link>
                </h3>
                <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">
                  {proj.short_description}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {proj.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-paper text-muted border border-line"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/projects/${proj.slug}`}
                  className="text-xs font-semibold text-copper hover:underline"
                >
                  Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Writing Section */}
      <section className="bg-card border-y border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-3">Writing</p>
              <h2 className="font-display font-semibold text-2xl md:text-3xl text-ink">
                Latest from the blog
              </h2>
            </div>
            <Link
              to="/blogs"
              className="text-sm font-semibold text-copper hover:underline flex items-center gap-1"
            >
              View all posts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {featuredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="group block bg-paper border border-line rounded-2xl p-7 hover:border-copper/50 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 text-xs text-muted-subtle mb-3 font-medium">
                    <time>{blog.published_at}</time>
                    <span>·</span>
                    <span>{blog.reading_time}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink group-hover:text-copper transition-colors">
                    <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">
                    {blog.summary}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-card text-muted border border-line"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="text-xs font-semibold text-copper hover:underline"
                  >
                    Read article &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Banner Section */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="bg-[#0F1D24] text-[#FAF8F5] rounded-3xl p-10 md:p-14 relative overflow-hidden border border-line shadow-md">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper mb-3">
              Ready to collaborate?
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 text-white">
              Let's build something scalable & reliable.
            </h2>
            <p className="text-[#FAF8F5]/70 text-base mb-8 leading-relaxed">
              Whether you need a full-stack engineer for a production application, cloud modernization, or technical consultation, feel free to reach out.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-full bg-copper text-white text-sm font-semibold hover:bg-opacity-90 transition-colors"
              >
                Get in touch
              </Link>
              <a
                href={`mailto:${profile.email}`}
                className="px-6 py-3.5 rounded-full border border-white/20 text-white text-sm font-semibold hover:border-white transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none hidden md:block">
            <Terminal className="w-64 h-64 text-white" />
          </div>
        </div>
      </section>
    </div>
  );
};
