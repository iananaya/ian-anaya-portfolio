import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { colorInput } from '@sanity/color-input' // ✅ Import the color input plugin
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'ian-anaya-portfolio',

  projectId: '7lj6cjs8',
  dataset: 'production',

  // ✅ Added colorInput plugin alongside structure and vision tools
  plugins: [structureTool(), visionTool(), colorInput()],

  schema: {
    types: schemaTypes,
  },
})
