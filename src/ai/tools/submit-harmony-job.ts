'use server';

/**
 * @fileOverview A Genkit tool for submitting a processing job to the NASA Harmony API.
 * - submitHarmonyJob - A tool that sends a request to Harmony and returns a job ID.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Zod schema for the input of the Harmony job submission tool.
export const HarmonyJobInputSchema = z.object({
  datasetId: z.string().describe('The short name or concept ID of the NASA dataset to process (e.g., "ASTGTM_NC.003" for ASTER DEM).'),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).describe('The bounding box for the area of interest as [minLon, minLat, maxLon, maxLat].'),
  outputCrs: z.string().optional().default('EPSG:4326').describe('The EPSG code for the output coordinate reference system.'),
  maxResults: z.number().optional().default(10).describe('The maximum number of results to return.'),
});

// Zod schema for the output of the Harmony job submission tool.
export const HarmonyJobOutputSchema = z.object({
  jobId: z.string().describe('The unique identifier for the submitted Harmony processing job.'),
  statusUrl: z.string().url().describe('The URL to poll for the job status.'),
});

export const submitHarmonyJob = ai.defineTool(
  {
    name: 'submitHarmonyJob',
    description: 'Submits a data processing job to the NASA Harmony API for a given dataset and bounding box. Returns a job ID for polling the status.',
    inputSchema: HarmonyJobInputSchema,
    outputSchema: HarmonyJobOutputSchema,
  },
  async ({ datasetId, bbox, outputCrs, maxResults }) => {
    const harmonyApiUrl = 'https://cmr.earthdata.nasa.gov/harmony/api/service/jobs';

    // The Harmony API requires a specific structure for the request body.
    const jobPayload = {
      source: {
        collection: datasetId,
        spatial: {
          bbox: bbox,
        },
      },
      format: {
        crs: outputCrs,
        // Example of specifying a specific output format if needed
        // mime: 'image/tiff', 
      },
      maxResults: maxResults,
    };
    
    try {
      const response = await fetch(harmonyApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Harmony API doesn't typically require an API key in the header,
          // but authentication might be needed for certain datasets or higher rate limits.
          // This would be handled via Earthdata Login token. For now, we assume public access.
        },
        body: JSON.stringify(jobPayload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Harmony API request failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      const jobId = result.jobID;

      if (!jobId) {
        throw new Error('Harmony API did not return a jobID.');
      }
      
      const statusUrl = `${harmonyApiUrl}/${jobId}`;

      return {
        jobId: jobId,
        statusUrl: statusUrl,
      };

    } catch (error: any) {
      console.error('Error in submitHarmonyJob tool:', error);
      throw new Error(`Failed to submit job to NASA Harmony API: ${error.message}`);
    }
  }
);
