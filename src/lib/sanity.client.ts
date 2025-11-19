// src/lib/sanity.client.ts
import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: '7lj6cjs8',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: true,
});
