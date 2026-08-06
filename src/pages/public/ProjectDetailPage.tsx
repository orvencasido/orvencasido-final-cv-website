import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { getProjectBySlug } from '../../lib/services';
import { Project } from '../../types';
import { LoadingSkeleton, EmptyState, StatusBadge } from '../../components/ui/CommonUI';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      try {
        const data = await getProjectBySlug(slug);
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <EmptyState
          title="Project Not Found"
          description="The requested project case study could not be located."
          action={
            <Link
              to="/projects"
              className="px-5 py-2.5 text-xs font-semibold bg-[#111F24] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#111F24] rounded-full hover:bg-copper transition-colors"
            >
              Back to all projects
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-copper transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      {/* Hero Cover Image & Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <StatusBadge status={project.status} type="project" />
              <span className="text-xs text-muted-subtle flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-copper" /> Completed: {project.completion_date}
              </span>
            </div>
            <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink">
              {project.title}
            </h1>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-ink bg-card border border-line rounded-full hover:border-copper transition-colors"
              >
                <Github className="w-4 h-4" /> GitHub Code
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-copper rounded-full hover:bg-opacity-90 transition-colors shadow-xs"
              >
                Live Demo <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {project.cover_image_url && (
          <div className="rounded-3xl overflow-hidden border border-line aspect-video bg-card shadow-sm">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Technologies Used Grid */}
      <div className="p-6 rounded-2xl border border-line bg-card space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-copper flex items-center gap-2">
          <Layers className="w-4 h-4" /> Technologies & Infrastructure Stack
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-paper text-muted border border-line"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Case Study Full Description */}
      <div className="space-y-5">
        <h2 className="font-display font-semibold text-2xl text-ink flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-copper" /> Project Overview & Technical Architecture
        </h2>
        <div className="prose max-w-none text-muted leading-relaxed text-base whitespace-pre-line">
          {project.full_description}
        </div>
      </div>
    </div>
  );
};
