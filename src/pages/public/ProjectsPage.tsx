import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Github, ExternalLink, ArrowRight } from 'lucide-react';
import { getProjects } from '../../lib/services';
import { Project } from '../../types';
import { EmptyState, LoadingSkeleton, StatusBadge } from '../../components/ui/CommonUI';

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
      <div className="max-w-6xl mx-auto px-6 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <p className="eyebrow mb-3">Portfolio</p>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink">
          Featured Projects & Case Studies
        </h1>
        <p className="mt-4 text-base text-muted max-w-2xl leading-relaxed">
          A showcase of full-stack web applications, cloud infrastructure pipelines, and interactive developer tools.
        </p>
      </div>

      {/* Search Bar */}
      <div className="pt-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-subtle" />
          <input
            type="text"
            placeholder="Search projects by name, technology, or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm bg-card border border-line rounded-full focus:outline-none focus:border-copper transition-colors text-ink placeholder:text-muted-subtle"
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
              onClick={() => setSearchQuery('')}
              className="px-5 py-2.5 text-xs font-semibold bg-[#111F24] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#111F24] rounded-full hover:bg-copper transition-colors"
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
              className="group flex flex-col rounded-3xl border border-line bg-card overflow-hidden hover:border-copper/40 transition-all shadow-xs"
            >
              <div className="aspect-video w-full overflow-hidden bg-paper relative border-b border-line">
                {project.cover_image_url ? (
                  <img
                    src={project.cover_image_url}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-muted text-lg">
                    {project.title}
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <StatusBadge status={project.status} type="project" />
                </div>
              </div>

              <div className="p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h2 className="font-display text-xl font-semibold text-ink group-hover:text-copper transition-colors">
                    <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                  </h2>
                  <p className="text-sm text-muted leading-relaxed line-clamp-3">
                    {project.short_description}
                  </p>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-paper text-muted border border-line"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-4 border-t border-line">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="font-semibold text-copper hover:underline flex items-center gap-1"
                    >
                      Case Study <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-4">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-ink transition-colors flex items-center gap-1"
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
                          className="text-copper hover:underline flex items-center gap-1 font-semibold"
                        >
                          Live App <ExternalLink className="w-3.5 h-3.5" />
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
