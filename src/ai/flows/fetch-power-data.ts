'use server';

/**
 * @fileOverview Fetches weather data from the NASA POWER API for a specific location.
 * - fetchPowerData - Fetches hourly temperature, humidity, wind speed, and solar radiation.
 * - FetchPowerDataInput - The input type for the fetchPowerData function.
 * - FetchPowerDataOutput - The return type for the fetchPowerData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { format, sub } from 'date-fns';

const FetchPowerDataInputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type FetchPowerDataInput = z.infer<typeof FetchPowerDataInputSchema>;

const PowerDataPointSchema = z.object({
  hour: z.number(),
  year: z.number(),
  month: z.number(),
  day: z.number(),
  T2M: z.number().describe('Temperature at 2 Meters (C)'),
  RH2M: z.number().describe('Relative Humidity at 2 Meters (%)'),
  WS10M: z.number().describe('Wind Speed at 10 Meters (m/s)'),
  ALLSKY_SFC_SW_DWN: z.number().describe('All Sky Insolation Incident on a Horizontal Surface (W/m^2)'),
});

const FetchPowerDataOutputSchema = z.object({
  data: z.array(PowerDataPointSchema),
});
export type FetchPowerDataOutput = z.infer<typeof FetchPowerDataOutputSchema>;

export async function fetchPowerData(input: FetchPowerDataInput): Promise<FetchPowerDataOutput> {
  return fetchPowerDataFlow(input);
}

const fetchPowerDataFlow = ai.defineFlow(
  {
    name: 'fetchPowerDataFlow',
    inputSchema: FetchPowerDataInputSchema,
    outputSchema: FetchPowerDataOutputSchema,
  },
  async ({ latitude, longitude }) => {
    const apiKey = process.env.NASA_API_KEY;
    if (!apiKey) {
      throw new Error('NASA_API_KEY is not set.');
    }

    const today = new Date();
    // Fetch data for the last 24-48 hours to ensure we get a full 24-hour cycle
    const yesterday = sub(today, { days: 1 });
    const startDate = format(yesterday, 'yyyyMMdd');
    const endDate = format(today, 'yyyyMMdd');

    const params = new URLSearchParams({
      parameters: 'T2M,RH2M,WS10M,ALLSKY_SFC_SW_DWN',
      community: 'AG',
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      start: startDate,
      end: endDate,
      format: 'JSON',
    });

    const url = `https://power.larc.nasa.gov/api/temporal/hourly/point?${params.toString()}`;

    try {
      const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch NASA POWER data: ${response.statusText} - ${errorText}`);
      }
      const rawData = await response.json();
      
      if (!rawData.properties?.parameter) {
          throw new Error('Invalid data structure received from NASA POWER API. "parameter" property is missing.');
      }

      const properties = rawData.properties.parameter;
      // Timestamps are in the geometry object
      const timestamps = Object.keys(properties.T2M);

      const data: z.infer<typeof PowerDataPointSchema>[] = timestamps.map((time: string) => {
         const year = parseInt(time.substring(0, 4), 10);
         const month = parseInt(time.substring(4, 6), 10);
         const day = parseInt(time.substring(6, 8), 10);
         const hour = parseInt(time.substring(9, 11), 10);

        return {
          year,
          month,
          day,
          hour,
          T2M: properties.T2M?.[time] ?? -999, // Use -999 or another sentinel value for missing data
          RH2M: properties.RH2M?.[time] ?? -999,
          WS10M: properties.WS10M?.[time] ?? -999,
          ALLSKY_SFC_SW_DWN: properties.ALLSKY_SFC_SW_DWN?.[time] ?? -999,
        };
      });

      return { data };

    } catch (error) {
      console.error('Error in fetchPowerDataFlow:', error);
      throw new Error('Failed to fetch or process NASA POWER data.');
    }
  }
);
