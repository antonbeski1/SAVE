'use server';

/**
 * @fileOverview Provides a flow to help administrators understand the differences between risk model versions.
 *
 * - getModelDiff - A function that retrieves and summarizes the differences between two risk model versions.
 * - GetModelDiffInput - The input type for the getModelDiff function.
 * - GetModelDiffOutput - The return type for the getModelDiff function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetModelDiffInputSchema = z.object({
  previousModelVersion: z
    .string()
    .describe('The version tag of the previous risk model.'),
  currentModelVersion: z
    .string()
    .describe('The version tag of the current risk model.'),
});
export type GetModelDiffInput = z.infer<typeof GetModelDiffInputSchema>;

const GetModelDiffOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A human-readable summary of the differences between the two model versions, highlighting key changes and potential impacts.'
    ),
});
export type GetModelDiffOutput = z.infer<typeof GetModelDiffOutputSchema>;

export async function getModelDiff(input: GetModelDiffInput): Promise<GetModelDiffOutput> {
  return getModelDiffFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getModelDiffPrompt',
  input: {schema: GetModelDiffInputSchema},
  output: {schema: GetModelDiffOutputSchema},
  prompt: `You are an expert in risk model analysis.
  Your task is to compare two versions of a risk model and provide a concise summary of the key differences for an administrator.

  Previous Model Version: {{{previousModelVersion}}}
  Current Model Version: {{{currentModelVersion}}}

  Focus on changes that could impact risk score calculations, alert thresholds, or overall system behavior.
  The summary should be easily understandable and actionable for decision-making regarding model rollbacks.
`,
});

const getModelDiffFlow = ai.defineFlow(
  {
    name: 'getModelDiffFlow',
    inputSchema: GetModelDiffInputSchema,
    outputSchema: GetModelDiffOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
