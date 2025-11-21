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
  // EONET provides coordinates as [longitude, latitude]
  coordinates: z.tuple([z.number(), z.number()]).describe('Longitude and latitude'),
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
      const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50');
      if (!response.ok) {
        throw new Error(`Failed to fetch EONET events: ${response.statusText}`);
      }
      const data = await response.json();

      const events = data.events.map((event: any) => {
        // Find the first point geometry in the event
        const pointGeometry = event.geometry.find((geom: any) => geom.type === 'Point');
        
        if (pointGeometry) {
          return {
            id: event.id,
            title: event.title,
            category: event.categories[0]?.title || 'Unknown',
            coordinates: pointGeometry.coordinates,
          };
        }
        return null;
      }).filter((e: any): e is z.infer<typeof EonetEventSchema> => e !== null);

      return { events };
    } catch (error) {
      console.error('Error in fetchEonetEventsFlow:', error);
      // Return empty array on error to prevent crashing the UI
      return { events: [] };
    }
  }
);
