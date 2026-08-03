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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Project Not Found"
          description="The requested project case study could not be located."
          action={
            <Link
              to="/projects"
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl"
            >
              Back to all projects
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      {/* Hero Cover Image & Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status} type="project" />
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Completed: {project.completion_date}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
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
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 transition"
              >
                <Github className="w-4 h-4" /> GitHub Code
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
              >
                Live Demo <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {project.cover_image_url && (
          <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-800 shadow-md">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Technologies Used Grid */}
      <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> Technologies & Infrastructure Stack
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs font-mono font-medium rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 shadow-xs"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Case Study Full Description */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Project Overview & Technical Architecture
        </h2>
        <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
          {project.full_description}
        </div>
      </div>
    </div>
  );
};
