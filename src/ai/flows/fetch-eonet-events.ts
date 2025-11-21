'use server';

/**
 * @fileOverview Fetches open natural hazard events from NASA's EONET API.
 *
 * - fetchEonetEvents - A function that fetches and returns current natural hazard events.
 * - FetchEonetEventsOutput - The return type for the fetchEonetEvents function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a single event
const EonetEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  geometry: z.array(z.object({
    magnitudeValue: z.number().optional(),
    magnitudeUnit: z.string().optional(),
    date: z.string(),
    type: z.string(),
    coordinates: z.array(z.number()),
  })),
});

const FetchEonetEventsOutputSchema = z.object({
  events: z.array(EonetEventSchema),
});
export type FetchEonetEventsOutput = z.infer<typeof FetchEonetEventsOutputSchema>;


export async function fetchEonetEvents(): Promise<FetchEonetEventsOutput> {
  return fetchEonetEventsFlow();
}

const fetchEonetEventsFlow = ai.defineFlow(
  {
    name: 'fetchEonetEventsFlow',
    inputSchema: z.void(),
    outputSchema: FetchEonetEventsOutputSchema,
  },
  async () => {
    try {
      // Fetch events from the last 24 hours
      const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=1&limit=999');
      if (!response.ok) {
        throw new Error(`Failed to fetch EONET events: ${response.statusText}`);
      }
      const data = await response.json();

      const events = data.events.map((event: any) => {
        // Filter out geometries that are not points for simplicity in some uses
        const pointGeometries = event.geometry.filter((geom: any) => geom.type === 'Point');

        // If there are no point geometries, we might not be able to use this event, but we'll keep it for now
        if (pointGeometries.length === 0 && event.geometry.length > 0) {
             // Let's create a pseudo-point from the first coordinate of the first geometry (e.g., a polygon)
             // This is a simplification but makes it usable.
             const pseudoPoint = {
                 date: event.geometry[0].date,
                 type: 'Point',
                 coordinates: event.geometry[0].coordinates[0][0] // Taking a coordinate from a polygon
             };
             event.geometry.push(pseudoPoint);
        }

        return {
            id: event.id,
            title: event.title,
            category: event.categories[0]?.title || 'Unknown',
            geometry: event.geometry,
        };
      }).filter((e: any): e is z.infer<typeof EonetEventSchema> => e !== null);

      return { events };
    } catch (error) {
      console.error('Error in fetchEonetEventsFlow:', error);
      // Return empty array on error to prevent crashing the UI
      return { events: [] };
    }
  }
);
