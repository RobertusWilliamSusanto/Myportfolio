import { projects, getLocalized, type Lang } from './profile';

export interface ProjectCatalogItem {
  id: string;
  triggerId: string;
  domains: string[];
  title: string;
  badge: string;
  category: string;
  description: string;
  techStack: string[];
  demoUrl: string | null;
  todoUrl: string | null;
  repoUrl: string | null;
}

const TRIGGER_MAP: Record<string, string> = {
  'yolo-object-detection': 'yolo',
  'sibarista-tourism-system': 'sibarista',
  'kriptografi-klasik-security': 'kriptografi',
  'digital-portfolio-web-apps': 'portfolio',
  'expense-tracker-automation': 'expense-tracker',
  'partsbin-inventory-bom': 'partsbin'
};

const DOMAIN_MAP: Record<string, string[]> = {
  yolo: ['ai'],
  sibarista: ['backend'],
  kriptografi: ['security'],
  portfolio: ['web'],
  'expense-tracker': ['web'],
  partsbin: ['web', 'backend']
};

export function getPublicProjectCatalog(lang: Lang): ProjectCatalogItem[] {
  return projects
    .filter((p) => p.title?.public !== false)
    .map((p) => {
      const triggerId = TRIGGER_MAP[p.id] || p.id;
      const links = p.links || {};
      const demoEntry = links.live_demo || links.portfolio_live;
      const todoEntry = links.todo_live;
      const repoEntry = links.github;
      return {
        id: p.id,
        triggerId,
        domains: DOMAIN_MAP[triggerId] || ['web'],
        title: getLocalized(p.title, lang),
        badge: p.badge?.public ? getLocalized(p.badge, lang) : '',
        category: p.category?.public ? getLocalized(p.category, lang) : '',
        description: p.description?.public ? getLocalized(p.description, lang) : '',
        techStack: p.tech_stack?.public ? p.tech_stack.value : [],
        demoUrl: demoEntry?.public && demoEntry.url ? demoEntry.url : null,
        todoUrl: todoEntry?.public && todoEntry.url ? todoEntry.url : null,
        repoUrl: repoEntry?.public && repoEntry.url ? repoEntry.url : null
      };
    });
}
