'use server';

/**
 * @fileOverview An AI agent for suggesting model updates based on ground truth data and model performance metrics.
 *
 * - suggestModelUpdates - A function that suggests potential improvements to the risk model.
 * - SuggestModelUpdatesInput - The input type for the suggestModelUpdates function.
 * - SuggestModelUpdatesOutput - The return type for the suggestModelUpdates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestModelUpdatesInputSchema = z.object({
  groundTruthData: z
    .string()
    .describe(
      'A string containing ground truth data reported by users, including hazard type, location (GPS), and images, if available.'
    ),
  modelPerformanceMetrics: z
    .string()
    .describe(
      'A string containing model performance metrics such as precision, recall, F1-score, and any identified biases or areas of weakness.'
    ),
  currentModelDescription: z
    .string()
    .describe('Description of the current model being used including version and datasets used.'),
});
export type SuggestModelUpdatesInput = z.infer<typeof SuggestModelUpdatesInputSchema>;

const SuggestModelUpdatesOutputSchema = z.object({
  suggestedUpdates: z
    .string()
    .describe(
      'A string containing suggestions for model updates, including specific areas for improvement, potential new features, and datasets to consider.'
    ),
  rationale: z
    .string()
    .describe(
      'A string explaining the rationale behind each suggested update, referencing the ground truth data and model performance metrics used to generate the suggestions.'
    ),
});
export type SuggestModelUpdatesOutput = z.infer<typeof SuggestModelUpdatesOutputSchema>;

export async function suggestModelUpdates(input: SuggestModelUpdatesInput): Promise<SuggestModelUpdatesOutput> {
  return suggestModelUpdatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestModelUpdatesPrompt',
  input: {schema: SuggestModelUpdatesInputSchema},
  output: {schema: SuggestModelUpdatesOutputSchema},
  prompt: `You are an AI expert in machine learning model optimization, specializing in risk assessment models for natural hazards. Based on the ground truth data, current model description, and performance metrics provided, suggest potential improvements to the risk model.

Ground Truth Data: {{{groundTruthData}}}
Model Performance Metrics: {{{modelPerformanceMetrics}}}
Current Model Description: {{{currentModelDescription}}}

Consider the following:
- Areas where the model is underperforming based on the provided metrics.
- Potential biases or limitations in the current model.
- New features or datasets that could improve the model accuracy and reliability.

Provide specific and actionable suggestions, along with a clear rationale for each suggestion.

Output should be structured with "suggestedUpdates" containing the suggestion and "rationale" explaining the reasoning behind the suggestion.`,
});

const suggestModelUpdatesFlow = ai.defineFlow(
  {
    name: 'suggestModelUpdatesFlow',
    inputSchema: SuggestModelUpdatesInputSchema,
    outputSchema: SuggestModelUpdatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
