export default {
  name: 'project',
  title: 'Projects',
  type: 'document',
  fields: [
    {
      name: 'projectType',
      title: 'Project Type',
      type: 'string',
      options: {
        list: [
          { title: 'Case Study', value: 'caseStudy' },
          { title: 'Lightbox', value: 'lightbox' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'caseStudy',
      description:
        'Choose whether this project opens a full page (Case Study) or a Lightbox Slideshow.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
    },
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'client',
      title: 'Client Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'displayPreference',
      title: 'Display on Project Tile',
      type: 'string',
      options: {
        list: [
          { title: 'Use Project Title', value: 'title' },
          { title: 'Use Client Name', value: 'client' },
        ],
        layout: 'radio',
      },
      initialValue: 'title',
      description:
        'Choose whether to show the project title or the client name on the /projects page.',
    },

    // 🧱 Case Study–only fields
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      hidden: ({ parent }: any) => parent?.projectType === 'lightbox',
      validation: (Rule: any) =>
        Rule.custom((value: unknown, context: any) => {
          return context.parent?.projectType === 'lightbox'
            ? true
            : value
            ? true
            : 'Slug is required for Case Studies';
        }),
    },
    {
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ parent }: any) => parent?.projectType === 'lightbox',
      description:
        'List of services provided for this project (e.g., Branding, Web Design, Typography).',
    },
    {
      name: 'overview',
      title: 'Overview',
      type: 'text',
      rows: 5,
      hidden: ({ parent }: any) => parent?.projectType === 'lightbox',
      description: 'Short paragraph describing the project.',
    },

    // 🖼 Shared fields
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Main banner or cover image for the project page or lightbox.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'projectImages',
      title: 'Project Images with Captions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
            },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
          preview: {
            select: { title: 'caption', media: 'image' },
            prepare({ title, media }: any) {
              return { title: title || 'Untitled Image', media };
            },
          },
        },
      ],
      options: { layout: 'grid' },
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Brand', value: 'brand' },
          { title: 'Logo', value: 'logo' },
          { title: 'Fonts', value: 'fonts' },
        ],
        layout: 'tags',
      },
      description: 'Assign one or more tags to categorize this project.',
    },
  ],
};
