export default {
  name: "typeface",
  title: "Typefaces",
  type: "document",
  fields: [
    {
      name: "familyName",
      title: "Font Family Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "familyName", maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "fontFiles",
      title: "Font Style(s)",
      type: "array",
      of: [
        {
          type: "object",
          title: "Font Style",
          fields: [
            {
              name: "styleName",
              title: "Font Style Name",
              type: "string",
              description: "Example: Regular, Bold, Italic, etc.",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "webFont",
              title: "Web Font (.woff or .woff2)",
              type: "file",
              options: { accept: [".woff", ".woff2"] },
              description: "Used for the on-site tester and previews.",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "sourceFont",
              title: "Source Font (.ttf or .otf)",
              type: "file",
              options: { accept: [".ttf", ".otf"] },
              description: "Used to extract and display full glyph set.",
            },
            {
              name: "isPrimary",
              title: "Primary Display Style",
              type: "boolean",
              description:
                "Enable this to use this style for previews on the Typefaces index page.",
            },
          ],
          preview: {
            select: { title: "styleName", isPrimary: "isPrimary" },
            prepare({ title, isPrimary }: any) {
              return {
                title: title || "Unnamed Style",
                subtitle: isPrimary ? "⭐ Primary Display Font" : "",
              };
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "previewText",
      title: "Preview Text",
      type: "string",
      description: "Optional. If blank, the default preview text will be used.",
    },
    {
      name: "sampleImages",
      title: "Sample Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
      options: { layout: "grid" },
      description:
        "Upload preview/sample images for the typeface detail page.",
    },
    {
      name: "accentColor",
      title: "Accent Color",
      type: "color",
      options: { disableAlpha: true },
      description:
        "Accent color for this typeface. Used in previews and title styling.",
    },
  ],
};
