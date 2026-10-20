import { z } from 'zod';

export const PublicFieldSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    value: valueSchema,
    public: z.boolean()
  });

export const ProjectLinkItemSchema = z.object({
  url: z.string().nullable().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
  public: z.boolean()
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  title: PublicFieldSchema(z.string()),
  badge: PublicFieldSchema(z.string().optional()).optional(),
  category: PublicFieldSchema(z.string()),
  flagship: PublicFieldSchema(z.boolean().optional()).optional(),
  description: PublicFieldSchema(z.string()),
  tech_stack: PublicFieldSchema(z.array(z.string())),
  assets: z.object({
    image: z.object({
      source: z.string().nullable().optional(),
      alt: z.string().nullable().optional(),
      public: z.boolean()
    }).optional()
  }).optional(),
  links: z.record(z.string(), ProjectLinkItemSchema).optional()
});

export const SkillCategorySchema = z.object({
  category: PublicFieldSchema(z.string()),
  description: PublicFieldSchema(z.string()),
  items: z.object({
    value: z.union([
      z.array(z.string()),
      z.array(z.object({ name: z.string(), level: z.string() }))
    ]),
    public: z.boolean()
  })
});

export const ProfileSchema = z.object({
  identity: z.object({
    name: PublicFieldSchema(z.string()),
    headline: z.object({
      id: z.string(),
      en: z.string(),
      public: z.boolean()
    }),
    location: z.object({
      city: z.string(),
      country: z.string(),
      display: z.string(),
      public: z.boolean()
    }),
    email: PublicFieldSchema(z.string().email()),
    phone: PublicFieldSchema(z.string().nullable()),
    student_id: PublicFieldSchema(z.string().nullable()),
    availability: z.object({
      status: z.string(),
      open_to_work: z.boolean(),
      public: z.boolean()
    })
  }),
  summary: z.object({
    id: PublicFieldSchema(z.string()),
    en: PublicFieldSchema(z.string())
  }),
  education: z.array(
    z.object({
      institution: PublicFieldSchema(z.string()),
      faculty: PublicFieldSchema(z.string()),
      department: PublicFieldSchema(z.string()),
      degree: PublicFieldSchema(z.string()),
      period: PublicFieldSchema(z.string()),
      status: PublicFieldSchema(z.string()),
      location: PublicFieldSchema(z.string()),
      description: PublicFieldSchema(z.string())
    })
  ),
  projects: z.array(ProjectItemSchema),
  experience: z.array(
    z.object({
      id: z.string(),
      title: PublicFieldSchema(z.string()),
      institution: PublicFieldSchema(z.string()),
      period: PublicFieldSchema(z.string()),
      type: PublicFieldSchema(z.string()),
      description: PublicFieldSchema(z.string()),
      tags: PublicFieldSchema(z.array(z.string()))
    })
  ),
  skills: z.record(z.string(), SkillCategorySchema),
  certifications: z.array(
    z.object({
      name: PublicFieldSchema(z.string()),
      category: PublicFieldSchema(z.string())
    })
  ).optional(),
  links: z.record(
    z.string(),
    z.object({
      url: z.string(),
      display: z.string(),
      public: z.boolean()
    })
  )
});

export type ProfileData = z.infer<typeof ProfileSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
