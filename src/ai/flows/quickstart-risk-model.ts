'use server';

/**
 * @fileOverview A flow that bootstraps a risk model configuration from a prompt.
 *
 * - `quickstartRiskModel`: A function that generates a risk model configuration.
 * - `QuickstartRiskModelInput`: The input type for the `quickstartRiskModel` function.
 * - `QuickstartRiskModelOutput`: The return type for the `quickstartRiskModel` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuickstartRiskModelInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A description of the desired risk model configuration, including the hazards to consider, the data sources available, and any specific requirements or constraints.'
    ),
});
export type QuickstartRiskModelInput = z.infer<typeof QuickstartRiskModelInputSchema>;

const QuickstartRiskModelOutputSchema = z.object({
  configuration: z
    .string()
    .describe(
      'A JSON string containing the risk model configuration, including parameters, thresholds, and escalation rules.'
    ),
});
export type QuickstartRiskModelOutput = z.infer<typeof QuickstartRiskModelOutputSchema>;

export async function quickstartRiskModel(input: QuickstartRiskModelInput): Promise<QuickstartRiskModelOutput> {
  return quickstartRiskModelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quickstartRiskModelPrompt',
  input: {schema: QuickstartRiskModelInputSchema},
  output: {schema: QuickstartRiskModelOutputSchema},
  prompt: `You are an expert risk model configuration generator.  You will take a high level prompt describing a risk model, and generate a JSON configuration string that can be used to bootstrap the model.  The configuration should include parameters, thresholds, and escalation rules. Make it valid JSON.

Prompt: {{{prompt}}}`,
});

const quickstartRiskModelFlow = ai.defineFlow(
  {
    name: 'quickstartRiskModelFlow',
    inputSchema: QuickstartRiskModelInputSchema,
    outputSchema: QuickstartRiskModelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
