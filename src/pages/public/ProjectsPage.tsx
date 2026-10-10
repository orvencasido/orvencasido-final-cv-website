import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Github, ExternalLink, ArrowRight, ChevronDown, X, Calendar, Code2 } from 'lucide-react';
import { getProjects, getSkills } from '../../lib/services';
import { Project, Skill } from '../../types';
import { isLiveUrlVisible, getCleanLiveUrl } from '../../lib/techIcons';
import { SectionHeader, EmptyState, StatusBadge, ProjectCoverImage, ProjectTechBadge } from '../../components/ui/CommonUI';
import { ProjectGridSkeleton } from '../../components/ui/ShimmerSkeleton';
import { SEOHead } from '../../seo/SEOHead';
import { PAGE_SEO_CONFIG } from '../../seo/seoConfig';

const PAGE_SIZE = 6;

function getProjectTimestamp(project: Project): number {
  if (project.completion_date) {
    const parsed = new Date(project.completion_date).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  if (project.created_at) {
    const parsed = new Date(project.created_at).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const [projData, skillData] = await Promise.all([getProjects(), getSkills()]);
        setProjects(projData);
        setSkills(skillData);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setVisibleCount(PAGE_SIZE);
  };

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  // 1. Sort projects by date descending (most recent first)
  const sortedProjects = [...projects].sort((a, b) => {
    return getProjectTimestamp(b) - getProjectTimestamp(a);
  });

  // 2. Filter sorted projects by search query
  const filteredProjects = sortedProjects.filter((project) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      project.title.toLowerCase().includes(query) ||
      project.short_description.toLowerCase().includes(query) ||
      project.full_description.toLowerCase().includes(query) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(query))
    );
  });

  // 3. Slice for pagination (max of 6 initially, then increments by 6 on "See More")
  const displayedProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12">
        <SectionHeader
          title="Shipped Projects"
          description="Projects, experiments, and ideas I've brought to life—built to learn, solve problems, and occasionally break things."
        />
        <ProjectGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      <SEOHead {...PAGE_SEO_CONFIG.projects} />

      <SectionHeader
        title="Shipped Projects"
        description="Cloud infrastructure, automated CI/CD systems, and distributed platforms."
      />

      {/* Search Bar */}
      <div className="py-1 sm:py-2">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by title, stack, or keywords..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-3.5 min-h-[48px] text-sm sm:text-base bg-beige-50 border border-beige-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs placeholder:text-matcha-700/60"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-matcha-600 hover:text-matcha-950 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-beige-200 transition cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match your search"
          description="Try adjusting your search query to find relevant work."
          action={
            <button
              onClick={handleClearSearch}
              className="px-6 py-3 min-h-[44px] text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition cursor-pointer"
            >
              Clear Search
            </button>
          }
        />
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            {displayedProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 overflow-hidden hover:border-matcha-300 hover:shadow-md transition-all"
              >
                <div className="aspect-video w-full overflow-hidden bg-beige-200 relative flex items-center justify-center">
                  <ProjectCoverImage url={project.cover_image_url} title={project.title} />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <StatusBadge status={project.status} type="project" />
                  </div>
                </div>

                <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col justify-between space-y-5 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    {project.completion_date && (
                      <div className="flex items-center gap-1.5 text-xs text-matcha-600 font-mono font-medium">
                        <Calendar className="w-3.5 h-3.5 text-matcha-600 shrink-0" />
                        <span>{project.completion_date}</span>
                      </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-extrabold text-matcha-950 group-hover:text-matcha-700 transition">
                      <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                    </h2>
                    <p className="text-sm sm:text-base text-matcha-700 leading-relaxed font-normal">
                      {project.short_description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 flex-wrap min-h-7">
                      {project.technologies.map((tech) => (
                        <ProjectTechBadge key={tech} tech={tech} skills={skills} />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm pt-4 border-t border-beige-200">
                      <Link
                        to={`/projects/${project.slug}`}
                        className="font-bold text-matcha-900 group-hover:text-matcha-700 inline-flex items-center gap-1.5 transition-colors min-h-[44px]"
                      >
                        Explore project &rarr;
                      </Link>

                      <div className="flex items-center gap-3">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-matcha-700 hover:text-matcha-950 min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold rounded-xl hover:bg-beige-200 transition"
                            title="Source Code"
                            aria-label="View source code on GitHub"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {isLiveUrlVisible(project.live_url) && (
                          <a
                            href={getCleanLiveUrl(project.live_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-matcha-900 hover:underline inline-flex items-center gap-1 font-extrabold min-h-[44px] px-3 rounded-xl hover:bg-beige-200 transition"
                          >
                            Preview <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* See More / Pagination Controls */}
          {hasMore && (
            <div className="pt-4 flex flex-col items-center justify-center space-y-3">
              <button
                type="button"
                onClick={handleSeeMore}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 min-h-[48px] text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 active:scale-[0.98] transition-all shadow-sm cursor-pointer group"
              >
                <span>See More Projects</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
              <p className="text-xs font-mono text-matcha-600">
                Showing {displayedProjects.length} of {filteredProjects.length} projects
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
