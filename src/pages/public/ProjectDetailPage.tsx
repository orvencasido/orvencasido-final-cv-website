import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { getProjectBySlug, getSkills } from '../../lib/services';
import { Project, Skill } from '../../types';
import { isLiveUrlVisible, getCleanLiveUrl } from '../../lib/techIcons';
import { EmptyState, StatusBadge, ProjectTechBadge } from '../../components/ui/CommonUI';
import { ShimmerBlock } from '../../components/ui/ShimmerSkeleton';
import { SEOHead } from '../../seo/SEOHead';
import { getProjectSchema } from '../../seo/structuredData';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      try {
        const [projData, skillData] = await Promise.all([getProjectBySlug(slug), getSkills()]);
        setProject(projData);
        setSkills(skillData);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-8">
        <ShimmerBlock className="h-6 w-36" rounded="rounded-xl" />
        <div className="space-y-4">
          <ShimmerBlock className="h-10 sm:h-12 w-3/4" rounded="rounded-2xl" />
          <ShimmerBlock className="h-6 w-1/3" rounded="rounded-xl" />
        </div>
        <ShimmerBlock className="aspect-video w-full rounded-2xl sm:rounded-3xl" />
        <div className="space-y-3 pt-4">
          <ShimmerBlock className="h-4 w-full" rounded="rounded-lg" />
          <ShimmerBlock className="h-4 w-5/6" rounded="rounded-lg" />
          <ShimmerBlock className="h-4 w-2/3" rounded="rounded-lg" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <SEOHead title="Project Not Found | Orven Casido" noindex={true} />
        <EmptyState
          title="Project Not Found"
          description="The requested project case study could not be located."
          action={
            <Link
              to="/projects"
              className="px-6 py-3 min-h-[44px] inline-flex items-center text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition"
            >
              Back to all projects
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      <SEOHead
        title={`${project.title} | Orven Casido Case Study`}
        description={project.short_description}
        canonicalPath={`/projects/${project.slug}`}
        ogImage={project.cover_image_url}
        ogType="article"
        keywords={project.technologies}
        jsonLd={getProjectSchema(project)}
      />

      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-sm font-bold text-matcha-700 hover:text-matcha-950 transition cursor-pointer min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      {/* Hero Cover Image & Header */}
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-beige-200">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <StatusBadge status={project.status} type="project" />
              {project.completion_date && (
                <span className="text-xs text-matcha-600 font-mono flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4" /> Completed: {project.completion_date}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-matcha-950 break-words leading-tight">
              {project.title}
            </h1>
          </div>

          {/* Quick Action Links (Stacked cleanly on mobile) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] text-xs font-semibold text-matcha-900 bg-beige-50 border border-beige-200 rounded-full hover:border-matcha-300 hover:bg-beige-100/60 transition shadow-2xs"
              >
                <Github className="w-4 h-4 text-matcha-700" /> GitHub Code
              </a>
            )}
            {isLiveUrlVisible(project.live_url) && (
              <a
                href={getCleanLiveUrl(project.live_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] text-xs font-semibold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full transition shadow-xs"
              >
                Live Demo <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {project.cover_image_url && (
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-beige-200 aspect-video bg-beige-200 shadow-md">
            <img
              src={project.cover_image_url}
              alt={`${project.title} - Cloud & DevOps project by Orven Casido`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Technologies Used Stack */}
      <div className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 space-y-4 shadow-2xs">
        <h3 className="text-xs font-semibold text-matcha-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-matcha-600" /> Tech & Infrastructure Stack
        </h3>
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap min-h-7">
          {project.technologies.map((tech) => (
            <ProjectTechBadge key={tech} tech={tech} skills={skills} />
          ))}
        </div>
      </div>

      {/* Case Study Full Description */}
      <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
        <h2 className="text-xl sm:text-2xl font-bold text-matcha-950 flex items-center gap-2.5 sm:gap-3">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-matcha-600 shrink-0" />
          <span>Project Overview & Architecture</span>
        </h2>
        <div className="prose max-w-none text-matcha-800 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line font-normal break-words [overflow-wrap:anywhere]">
          {project.full_description}
        </div>
      </div>
    </div>
  );
};
