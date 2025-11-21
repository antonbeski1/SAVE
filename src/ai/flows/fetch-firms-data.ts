'use server';

/**
 * @fileOverview Fetches active fire data from NASA's FIRMS API.
 * - fetchFirmsData - Fetches and returns active fire points for the last 24 hours.
 * - FetchFirmsDataOutput - The return type for the fetchFirmsData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FirmsPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  brightness: z.number(),
  confidence: z.string(),
});

const FetchFirmsDataOutputSchema = z.object({
  firePoints: z.array(FirmsPointSchema),
});
export type FetchFirmsDataOutput = z.infer<typeof FetchFirmsDataOutputSchema>;

export async function fetchFirmsData(): Promise<FetchFirmsDataOutput> {
  return fetchFirmsDataFlow();
}

const fetchFirmsDataFlow = ai.defineFlow(
  {
    name: 'fetchFirmsDataFlow',
    inputSchema: z.void(),
    outputSchema: FetchFirmsDataOutputSchema,
  },
  async () => {
    const apiKey = process.env.NASA_API_KEY;
    if (!apiKey) {
      console.error('NASA_API_KEY is not set.');
      return { firePoints: [] };
    }

    // API endpoint for VIIRS S-NPP NRT data for the whole world in the last 24 hours.
    const mapKey = 'VIIRS_NOAA20_NRT'; 
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/${mapKey}/world/1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch FIRMS data: ${response.statusText}`);
      }
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',');

      // Find indices of required columns
      const latIndex = headers.indexOf('latitude');
      const lonIndex = headers.indexOf('longitude');
      const brightnessIndex = headers.indexOf('bright_ti4'); // TI4 is brightness temp in Kelvin for VIIRS
      const confidenceIndex = headers.indexOf('confidence');

      if (latIndex === -1 || lonIndex === -1 || brightnessIndex === -1 || confidenceIndex === -1) {
          throw new Error('Required columns not found in FIRMS CSV data. Headers: ' + headers.join(', '));
      }

      const firePoints = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          latitude: parseFloat(values[latIndex]),
          longitude: parseFloat(values[lonIndex]),
          brightness: parseFloat(values[brightnessIndex]),
          confidence: values[confidenceIndex],
        };
      }).filter(p => !isNaN(p.latitude) && !isNaN(p.longitude));

      return { firePoints };

    } catch (error) {
      console.error('Error in fetchFirmsDataFlow:', error);
      return { firePoints: [] };
    }
  }
);
