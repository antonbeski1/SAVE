'use server';

/**
 * @fileOverview An AI agent for analyzing environmental risks based on multiple NASA data sources.
 *
 * - analyzeRisk - A function that analyzes risks for a given location.
 * - AnalyzeRiskInput - The input type for the analyzeRisk function.
 * - AnalyzeRiskOutput - The return type for the analyzeRisk function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchEonetEvents } from './fetch-eonet-events';
import { fetchFirmsData } from './fetch-firms-data';
import { fetchPowerData } from './fetch-power-data';

const AnalyzeRiskInputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type AnalyzeRiskInput = z.infer<typeof AnalyzeRiskInputSchema>;

const RiskAssessmentSchema = z.object({
    level: z.enum(['Low', 'Medium', 'High', 'Very High']).describe('The calculated risk level.'),
    reasoning: z.string().describe('A brief explanation for the assessed risk level, citing the data sources used.'),
});

const AnalyzeRiskOutputSchema = z.object({
  wildfire: RiskAssessmentSchema,
  heatwave: RiskAssessmentSchema,
  flood: RiskAssessmentSchema,
  landslide: RiskAssessmentSchema,
});
export type AnalyzeRiskOutput = z.infer<typeof AnalyzeRiskOutputSchema>;

export async function analyzeRisk(input: AnalyzeRiskInput): Promise<AnalyzeRiskOutput> {
  return analyzeRiskFlow(input);
}

// Helper function to find nearest events and stringify them for the prompt
const getNearbyData = (lat: number, lon: number, items: any[], getCoords: (item: any) => [number, number] | null, maxDistanceKm: number, maxItems: number) => {
    const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    return items
        .map(item => {
            const coords = getCoords(item);
            if (!coords) return null;
            const [itemLon, itemLat] = coords;
            return {
                ...item,
                distance: haversineDistance(lat, lon, itemLat, itemLon)
            };
        })
        .filter((item): item is (typeof items[0] & { distance: number }) => item !== null && item.distance <= maxDistanceKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxItems);
}


const analyzeRiskFlow = ai.defineFlow(
  {
    name: 'analyzeRiskFlow',
    inputSchema: AnalyzeRiskInputSchema,
    outputSchema: AnalyzeRiskOutputSchema,
  },
  async ({ latitude, longitude }) => {
    // 1. Fetch all necessary data in parallel
    const [powerData, firmsData, eonetData] = await Promise.all([
      fetchPowerData({ latitude, longitude }),
      fetchFirmsData(),
      fetchEonetEvents()
    ]);

    // 2. Pre-process data to find relevant events
    const nearbyFires = getNearbyData(latitude, longitude, firmsData.firePoints, (item) => [item.longitude, item.latitude], 200, 10);
    
    const nearbyEvents = getNearbyData(latitude, longitude, eonetData.events, (item) => {
        const point = item.geometry.find(g => g.type === 'Point');
        return point ? (point.coordinates as [number, number]) : null;
    }, 500, 10);

    // Stringify for the prompt context
    const powerContext = JSON.stringify(powerData.data.slice(-24), null, 2); // Last 24 hours
    const firmsContext = JSON.stringify(nearbyFires, null, 2);
    const eonetContext = JSON.stringify(nearbyEvents, null, 2);

    // 3. Define the prompt with the fetched data
    const prompt = `You are a sophisticated environmental risk assessment AI for the AlertWave platform. Your task is to analyze the provided data for a specific location and determine the risk level for Wildfire, Heatwave, Flood, and Landslide.

    **Location:**
    - Latitude: ${latitude}
    - Longitude: ${longitude}
    
    **Data Sources:**
    
    1.  **NASA POWER (Weather Data - Last 24 Hours):** This provides hourly temperature (T2M in Celsius), relative humidity (RH2M in %), and wind speed (WS10M in m/s). High temperatures and low humidity increase fire and heatwave risk. High wind speeds can spread fires.
        \`\`\`json
        ${powerContext}
        \`\`\`

    2.  **NASA FIRMS (Fire Information - Nearby Active Fires in last 24h):** This shows active fires within a 200km radius. The presence of nearby fires significantly increases wildfire risk. Note 'brightness' (temperature in Kelvin), 'confidence', and 'distance' (in km).
        \`\`\`json
        ${firmsContext}
        \`\`\`

    3.  **NASA EONET (Natural Events - Nearby in last 24h):** This lists major natural events within a 500km radius. Proximity (see 'distance' in km) and category are critical for risk correlation. Pay close attention to categories like 'Severe Storms' (flood/landslide risk), 'Wildfires', and 'Floods'. The presence and proximity of these events directly influence the risk scores.
        \`\`\`json
        ${eonetContext}
        \`\`\`

    **Analysis Task:**
    Based *only* on the data provided, assess the risk for each of the following hazards. For each hazard, you must provide a risk level ('Low', 'Medium', 'High', 'Very High') and a concise reasoning that references the data sources and proximity of events.
    
    -   **Wildfire Risk:** Consider high temperatures, low humidity, high wind speeds, and especially the presence and proximity of nearby FIRMS fire points.
    -   **Heatwave Risk:** Focus on sustained high temperatures from the POWER data. Consider if any 'TemperatureExtremes' events are nearby in the EONET data.
    -   **Flood Risk:** Look for 'Severe Storms' or 'Floods' in EONET data. Proximity is key. POWER data alone is insufficient for flood risk without precipitation, but you can infer risk from major storm systems.
    -   **Landslide Risk:** Look for 'Severe Storms' or 'Landslides' in EONET data, which can trigger landslides. This risk is higher in areas with varied topography, but make your assessment based on the available data, particularly event proximity.

    Provide your output in the required JSON format with no extra commentary.`;

    const { output } = await ai.generate({
      prompt: prompt,
      output: { schema: AnalyzeRiskOutputSchema },
      model: 'googleai/gemini-2.5-flash',
    });

    return output!;
  }
);
