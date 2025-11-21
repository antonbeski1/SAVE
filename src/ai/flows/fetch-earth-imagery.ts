'use server';

/**
 * @fileOverview Fetches a satellite image chip from the NASA Earth Imagery API.
 * - fetchEarthImagery - Fetches an image for a given location and date.
 * - FetchEarthImageryInput - The input type for the fetchEarthImagery function.
 * - FetchEarthImageryOutput - The return type for the fetchEarthImagery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { format } from 'date-fns';

const FetchEarthImageryInputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  date: z.string().optional().describe('Date in YYYY-MM-DD format. Defaults to most recent.'),
  dim: z.number().optional().default(0.15).describe('Width and height of the image in degrees.')
});
export type FetchEarthImageryInput = z.infer<typeof FetchEarthImageryInputSchema>;

const FetchEarthImageryOutputSchema = z.object({
  imageUrl: z.string().url().describe('The URL of the fetched satellite image.'),
  imageDataUri: z.string().describe("A data URI of the image, encoded in Base64. Expected format: 'data:image/jpeg;base64,<encoded_data>'."),
  cloudScore: z.number().optional().describe('The cloud score of the image, if available.'),
});
export type FetchEarthImageryOutput = z.infer<typeof FetchEarthImageryOutputSchema>;

export async function fetchEarthImagery(input: FetchEarthImageryInput): Promise<FetchEarthImageryOutput> {
  return fetchEarthImageryFlow(input);
}

const fetchEarthImageryFlow = ai.defineFlow(
  {
    name: 'fetchEarthImageryFlow',
    inputSchema: FetchEarthImageryInputSchema,
    outputSchema: FetchEarthImageryOutputSchema,
  },
  async ({ latitude, longitude, date, dim }) => {
    const apiKey = process.env.NASA_API_KEY;
    if (!apiKey) {
      throw new Error('NASA_API_KEY is not set.');
    }

    const requestDate = date || format(new Date(), 'yyyy-MM-dd');

    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      date: requestDate,
      dim: dim!.toString(),
      cloud_score: 'True',
      api_key: apiKey,
    });

    const url = `https://api.nasa.gov/planetary/earth/imagery?${params.toString()}`;

    try {
      // First, call the API to get the image URL
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Failed to fetch Earth Imagery metadata: ${errorBody.msg || response.statusText}`);
      }
      const data = await response.json();

      if (!data.url) {
        throw new Error('No image URL returned from Earth Imagery API. The location may not have recent imagery.');
      }
      
      // Second, fetch the actual image from the returned URL
      const imageResponse = await fetch(data.url);
       if (!imageResponse.ok) {
        throw new Error(`Failed to download image from URL: ${data.url}`);
      }

      // Convert image to a Buffer and then to a Base64 data URI
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const imageDataUri = `data:${mimeType};base64,${base64Image}`;

      return {
        imageUrl: data.url,
        imageDataUri: imageDataUri,
        cloudScore: data.cloud_score,
      };

    } catch (error: any) {
      console.error('Error in fetchEarthImageryFlow:', error);
      throw new Error(`Failed to fetch or process NASA Earth Imagery: ${error.message}`);
    }
  }
);
