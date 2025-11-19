// src/lib/sanity.client.ts
import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '7lj6cjs8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2023-01-01',
  useCdn: true, // `true` = faster, cached reads
  token: process.env.SANITY_READ_TOKEN, // optional: only needed if dataset is private
});

