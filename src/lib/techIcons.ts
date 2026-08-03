import { Skill } from '../types';

export function getTechIconUrl(skill: Partial<Skill> & { name: string }): string {
  if (skill.icon && (skill.icon.startsWith('http://') || skill.icon.startsWith('https://') || skill.icon.startsWith('data:'))) {
    return skill.icon;
  }

  if (skill.icon && skill.icon.trim().length > 0) {
    const cleanSlug = skill.icon.trim().toLowerCase().replace(/\s+/g, '');
    return `https://cdn.simpleicons.org/${cleanSlug}`;
  }

  const name = skill.name.toLowerCase();

  if (name.includes('kubernetes') || name.includes('k8s')) return 'https://cdn.simpleicons.org/kubernetes';
  if (name.includes('docker')) return 'https://cdn.simpleicons.org/docker';
  if (name.includes('linux') || name.includes('ubuntu')) return 'https://cdn.simpleicons.org/linux';
  if (name.includes('git') && !name.includes('hub') && !name.includes('lab')) return 'https://cdn.simpleicons.org/git';
  if (name.includes('aws') || name.includes('amazon')) return 'https://cdn.simpleicons.org/amazonaws';
  if (name.includes('azure')) return 'https://cdn.simpleicons.org/microsoftazure';
  if (name.includes('bash') || name.includes('terminal') || name.includes('shell')) return 'https://cdn.simpleicons.org/gnubash';
  if (name.includes('python')) return 'https://cdn.simpleicons.org/python';
  if (name.includes('helm')) return 'https://cdn.simpleicons.org/helm';
  if (name.includes('terraform')) return 'https://cdn.simpleicons.org/terraform';
  if (name.includes('ansible')) return 'https://cdn.simpleicons.org/ansible';
  if (name.includes('argo')) return 'https://cdn.simpleicons.org/argocd';
  if (name.includes('github')) return 'https://cdn.simpleicons.org/github';
  if (name.includes('gitlab')) return 'https://cdn.simpleicons.org/gitlab';
  if (name.includes('jenkins')) return 'https://cdn.simpleicons.org/jenkins';
  if (name.includes('bitbucket')) return 'https://cdn.simpleicons.org/bitbucket';
  if (name.includes('jira')) return 'https://cdn.simpleicons.org/jira';
  if (name.includes('confluence')) return 'https://cdn.simpleicons.org/confluence';
  if (name.includes('prometheus')) return 'https://cdn.simpleicons.org/prometheus';
  if (name.includes('grafana')) return 'https://cdn.simpleicons.org/grafana';
  if (name.includes('elastic') || name.includes('elk')) return 'https://cdn.simpleicons.org/elasticsearch';
  if (name.includes('openai') || name.includes('chatgpt')) return 'https://cdn.simpleicons.org/openai';
  if (name.includes('claude') || name.includes('anthropic')) return 'https://cdn.simpleicons.org/anthropic';
  if (name.includes('react')) return 'https://cdn.simpleicons.org/react';
  if (name.includes('next')) return 'https://cdn.simpleicons.org/nextdotjs';
  if (name.includes('node')) return 'https://cdn.simpleicons.org/nodedotjs';
  if (name.includes('nginx')) return 'https://cdn.simpleicons.org/nginx';
  if (name.includes('typescript') || name.includes('ts')) return 'https://cdn.simpleicons.org/typescript';
  if (name.includes('golang') || name === 'go') return 'https://cdn.simpleicons.org/go';
  if (name.includes('postgres')) return 'https://cdn.simpleicons.org/postgresql';
  if (name.includes('tailwind')) return 'https://cdn.simpleicons.org/tailwindcss';

  const sanitized = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://cdn.simpleicons.org/${sanitized}`;
}
