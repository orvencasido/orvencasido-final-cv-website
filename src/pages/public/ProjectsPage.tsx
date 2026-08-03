import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Github, ExternalLink, ArrowRight, Code } from 'lucide-react';
import { getProjects } from '../../lib/services';
import { Project } from '../../types';
import { SectionHeader, EmptyState, LoadingSkeleton, StatusBadge } from '../../components/ui/CommonUI';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.short_description.toLowerCase().includes(query) ||
      project.full_description.toLowerCase().includes(query) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <SectionHeader
        title="Software & Cloud Projects"
        description="A showcase of infrastructure automation tools, enterprise dashboards, and open-source applications."
      />

      {/* Full Width Search Bar */}
      <div className="py-2 border-y border-zinc-200/80 dark:border-zinc-800/80">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects by name, description, or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition shadow-xs"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match your search"
          description="Try adjusting your search query."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl"
            >
              Clear Search
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm"
            >
              <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={project.status} type="project" />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {project.short_description}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1"
                    >
                      View Case Study <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-3">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1"
                          title="Source Code"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          Live <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
