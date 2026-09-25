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
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-8">
        <ShimmerBlock className="h-6 w-36" rounded="rounded-xl" />
        <div className="space-y-4">
          <ShimmerBlock className="h-10 sm:h-12 w-3/4" rounded="rounded-2xl" />
          <ShimmerBlock className="h-6 w-1/3" rounded="rounded-xl" />
        </div>
        <ShimmerBlock className="aspect-video w-full rounded-3xl" />
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
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-20">
        <SEOHead title="Project Not Found | Orven Casido" noindex={true} />
        <EmptyState
          title="Project Not Found"
          description="The requested project case study could not be located."
          action={
            <Link
              to="/projects"
              className="px-6 py-3 text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition"
            >
              Back to all projects
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12 animate-in fade-in duration-300">
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
        className="inline-flex items-center gap-2 text-sm font-bold text-matcha-700 hover:text-matcha-950 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      {/* Hero Cover Image & Header */}
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-4 border-b border-beige-300">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <StatusBadge status={project.status} type="project" />
              {project.completion_date && (
                <span className="text-xs text-matcha-600 font-mono flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4" /> Completed: {project.completion_date}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-matcha-950">
              {project.title}
            </h1>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-4">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold text-matcha-900 bg-beige-50 border border-beige-300 rounded-full hover:bg-beige-200 transition shadow-2xs"
              >
                <Github className="w-4 h-4" /> GitHub Code
              </a>
            )}
            {isLiveUrlVisible(project.live_url) && (
              <a
                href={getCleanLiveUrl(project.live_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full transition shadow-xs"
              >
                Live Demo <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {project.cover_image_url && (
          <div className="rounded-3xl overflow-hidden border border-beige-300 aspect-video bg-beige-200 shadow-md">
            <img
              src={project.cover_image_url}
              alt={`${project.title} - Cloud & DevOps project by Orven Casido`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Technologies Used Stack */}
      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-4 shadow-2xs">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-matcha-700 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Tech & Infrastructure Stack
        </h3>
        <div className="flex items-center gap-3 flex-wrap min-h-7">
          {project.technologies.map((tech) => (
            <ProjectTechBadge key={tech} tech={tech} skills={skills} />
          ))}
        </div>
      </div>

      {/* Case Study Full Description */}
      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-extrabold text-matcha-950 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-matcha-600" />
          <span>Project Overview & Architecture</span>
        </h2>
        <div className="prose max-w-none text-matcha-800 leading-relaxed text-base sm:text-lg whitespace-pre-line font-normal">
          {project.full_description}
        </div>
      </div>
    </div>
  );
};
