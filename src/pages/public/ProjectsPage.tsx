import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Github, ExternalLink, ArrowRight } from 'lucide-react';
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
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12">
      <SectionHeader
        title="Shipped Projects Im Proud of!"
        description="Projects, experiments, and ideas I've brought to life—built to learn, solve problems, and occasionally break things."
      />

      {/* Search Bar */}
      <div className="py-4">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600" />
          <input
            type="text"
            placeholder="Search projects by title, stack, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 text-base bg-beige-50 border border-beige-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs placeholder:text-matcha-700/60"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match your search"
          description="Try adjusting your search query to find relevant work."
          action={
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition cursor-pointer"
            >
              Clear Search
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-3xl border border-beige-300 bg-beige-50 overflow-hidden hover:border-matcha-400 hover:shadow-md transition-all"
            >
              <div className="aspect-video w-full overflow-hidden bg-beige-200 relative">
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <StatusBadge status={project.status} type="project" />
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-extrabold text-matcha-950 group-hover:text-matcha-700 transition">
                    <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                  </h2>
                  <p className="text-sm sm:text-base text-matcha-700 leading-relaxed font-normal">
                    {project.short_description}
                  </p>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-matcha-100 text-matcha-950 border border-matcha-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-beige-200">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="font-extrabold text-matcha-900 hover:text-matcha-700 flex items-center gap-1.5"
                    >
                      View Case Study <ArrowRight className="w-4 h-4" />
                    </Link>

                    <div className="flex items-center gap-4">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-matcha-700 hover:text-matcha-950 flex items-center gap-1 font-semibold"
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
                          className="text-matcha-900 hover:underline flex items-center gap-1 font-extrabold"
                        >
                          Live <ExternalLink className="w-4 h-4" />
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
