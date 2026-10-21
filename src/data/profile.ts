import profileJson from './profile.json';
import { ProfileSchema, type ProfileData } from './schema';

export const profile: ProfileData = ProfileSchema.parse(profileJson);

// Helper selectors for strictly public frontend data
export const identity = profile.identity;
export const summary = profile.summary;
export const projects = profile.projects;
export const experience = profile.experience;
export const skills = profile.skills;
export const education = profile.education;
export const links = profile.links;
