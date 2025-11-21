'use server';

/**
 * @fileOverview A Genkit tool for fetching a single map tile from the NASA GIBS WMTS service.
 * - getGibsTile - A tool that fetches a tile for a given layer, date, and coordinate.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const getGibsTile = ai.defineTool(
  {
    name: 'getGibsTile',
    description: 'Fetches a single map tile from the NASA GIBS WMTS service for a specific layer, date, and tile coordinate (z, y, x).',
    inputSchema: z.object({
      layer: z.string().describe('The GIBS layer ID, e.g., "MODIS_Terra_CorrectedReflectance_TrueColor".'),
      date: z.string().describe('The date for the tile in YYYY-MM-DD format.'),
      zoom: z.number().int().min(1).max(20).describe('The zoom level (z).'),
      y: z.number().int().min(0).describe('The tile y-coordinate.'),
      x: z.number().int().min(0).describe('The tile x-coordinate.'),
      format: z.string().optional().default('jpg').describe('The image format, e.g., "jpg" or "png".'),
      resolution: z.string().optional().default('500m').describe('The resolution of the tile, e.g., "250m", "500m", "1km".')
    }),
    outputSchema: z.object({
        imageDataUri: z.string().describe("A data URI of the tile image, encoded in Base64. Expected format: 'data:image/jpeg;base64,<encoded_data>'."),
        sourceUrl: z.string().url().describe('The source URL from which the tile was fetched.'),
    }),
  },
  async ({ layer, date, zoom, y, x, format, resolution }) => {
    const apiKey = process.env.NASA_API_KEY;
    if (!apiKey) {
      throw new Error('NASA_API_KEY is not set.');
    }

    const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${date}/${resolution}/${zoom}/${y}/${x}.${format}?api_key=${apiKey}`;

    try {
      const imageResponse = await fetch(tileUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download tile from URL: ${tileUrl}. Status: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || `image/${format}`;
      const imageDataUri = `data:${mimeType};base64,${base64Image}`;

      return {
        imageDataUri: imageDataUri,
        sourceUrl: tileUrl,
      };
    } catch (error: any) {
        console.error('Error in getGibsTile tool:', error);
        throw new Error(`Failed to fetch or process GIBS tile: ${error.message}`);
    }
  }
);
