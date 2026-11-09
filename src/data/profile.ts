import profileJson from './profile.json';
import { ProfileSchema, type ProfileData } from './schema';

export const profile: ProfileData = ProfileSchema.parse(profileJson);

export type Lang = 'id' | 'en';

export function getLocalized(field: any, lang: Lang = 'id'): string {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    if ('value' in field) {
      return getLocalized(field.value, lang);
    }
    if (lang in field) {
      return field[lang] || field.id || '';
    }
    if ('id' in field) {
      return field.id;
    }
  }
  return String(field);
}

// Helper selectors for strictly public frontend data
export const identity = profile.identity;
export const summary = profile.summary;
export const projects = profile.projects;
export const experience = profile.experience;
export const skills = profile.skills;
export const education = profile.education;
export const links = profile.links;
export const certifications = profile.certifications;
