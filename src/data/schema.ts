import { z } from 'zod';

export const LocalizedStringSchema = z.union([
  z.string(),
  z.object({
    id: z.string(),
    en: z.string()
  })
]);

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

export const PublicFieldSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    value: valueSchema,
    public: z.boolean()
  });

export const LocalizedPublicField = PublicFieldSchema(LocalizedStringSchema);

export const ProjectLinkItemSchema = z.object({
  url: z.string().nullable().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
  public: z.boolean()
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  title: LocalizedPublicField,
  badge: PublicFieldSchema(LocalizedStringSchema.optional()).optional(),
  category: LocalizedPublicField,
  flagship: PublicFieldSchema(z.boolean().optional()).optional(),
  description: LocalizedPublicField,
  tech_stack: PublicFieldSchema(z.array(z.string())),
  assets: z.object({
    image: z.object({
      source: z.string().nullable().optional(),
      alt: LocalizedStringSchema.nullable().optional(),
      public: z.boolean()
    }).optional()
  }).optional(),
  links: z.record(z.string(), ProjectLinkItemSchema).optional()
});

export const SkillCategorySchema = z.object({
  category: LocalizedPublicField,
  description: LocalizedPublicField,
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
      status: LocalizedStringSchema,
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
      institution: LocalizedPublicField,
      faculty: LocalizedPublicField,
      department: LocalizedPublicField,
      degree: LocalizedPublicField,
      period: LocalizedPublicField,
      status: LocalizedPublicField,
      location: LocalizedPublicField,
      description: LocalizedPublicField
    })
  ),
  projects: z.array(ProjectItemSchema),
  experience: z.array(
    z.object({
      id: z.string(),
      title: LocalizedPublicField,
      institution: LocalizedPublicField,
      period: LocalizedPublicField,
      type: LocalizedPublicField,
      description: LocalizedPublicField,
      tags: PublicFieldSchema(z.array(z.string()))
    })
  ),
  skills: z.record(z.string(), SkillCategorySchema),
  certifications: z.array(
    z.object({
      name: LocalizedPublicField,
      category: LocalizedPublicField
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
