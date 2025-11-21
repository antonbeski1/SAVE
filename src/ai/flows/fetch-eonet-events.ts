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
    coordinates: z.any(), // Allow for various geometry types (Point, Polygon, etc.)
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
      // Fetch open events from the last 24 hours
      const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=1&limit=999');
      if (!response.ok) {
        throw new Error(`Failed to fetch EONET events: ${response.statusText}`);
      }
      const data = await response.json();

      const events = data.events.map((event: any) => {
        // Find the first point geometry if available
        let pointGeometry = event.geometry.find((geom: any) => geom.type === 'Point');

        // If no point geometry, create a pseudo-point from the first coordinate of the first geometry (e.g., a polygon)
        // This is a simplification but makes it usable for map markers.
        if (!pointGeometry && event.geometry.length > 0 && event.geometry[0].coordinates) {
          const firstGeom = event.geometry[0];
          let representativeCoord;
          
          if (firstGeom.type === 'Polygon' && Array.isArray(firstGeom.coordinates[0][0])) {
            representativeCoord = firstGeom.coordinates[0][0]; // First vertex of the polygon
          } else if (firstGeom.type === 'LineString' && Array.isArray(firstGeom.coordinates[0])) {
            representativeCoord = firstGeom.coordinates[0]; // First point of the line
          }

          if (representativeCoord) {
             pointGeometry = {
                 date: firstGeom.date,
                 type: 'Point',
                 coordinates: representativeCoord
             };
             // Add this pseudo-point to the geometries array for consistency
             event.geometry.push(pointGeometry);
          }
        }
        
        return {
            id: event.id,
            title: event.title,
            category: event.categories[0]?.title || 'Unknown',
            geometry: event.geometry, // Return all geometries
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
