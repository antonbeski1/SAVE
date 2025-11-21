'use client';

import * as React from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { analyzeRisk, type AnalyzeRiskInput, type AnalyzeRiskOutput } from '@/ai/flows/analyze-risk';
import { Flame, Loader2, Mountain, ShieldAlert, Sun, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { villages } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function getRiskBadgeVariant(level: AnalyzeRiskOutput['wildfire']['level'] | undefined) {
  if (!level) return 'secondary';
  switch (level) {
    case 'Very High':
    case 'High':
      return 'destructive';
    case 'Medium':
      return 'warning';
    case 'Low':
      return 'success';
    default:
      return 'secondary';
  }
}

const RiskCard = ({ title, icon: Icon, assessment }: { title: string, icon: React.ElementType, assessment: AnalyzeRiskOutput['wildfire'] | undefined }) => (
  <Card>
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-base font-medium flex items-center gap-2"><Icon className="h-5 w-5" /> {title}</CardTitle>
      {assessment && <Badge variant={getRiskBadgeVariant(assessment.level)}>{assessment.level}</Badge>}
    </CardHeader>
    <CardContent>
      {assessment ? (
        <p className="text-sm text-muted-foreground">{assessment.reasoning}</p>
      ) : (
        <p className="text-sm text-muted-foreground">Analysis not run yet.</p>
      )}
    </CardContent>
  </Card>
);

export default function AnalyzeRiskPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [coords, setCoords] = React.useState({ lat: '34.0522', lon: '-118.2437' }); // Default to LA
  const [result, setResult] = React.useState<AnalyzeRiskOutput | null>(null);

  const handleVillageChange = (villageId: string) => {
    const village = villages.find(v => v.id === villageId);
    if (village) {
      setCoords({ lat: village.coords.lat.toString(), lon: village.coords.lon.toString() });
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const input: AnalyzeRiskInput = {
        latitude: parseFloat(coords.lat),
        longitude: parseFloat(coords.lon),
      };
      if (isNaN(input.latitude) || isNaN(input.longitude)) {
        throw new Error('Invalid latitude or longitude.');
      }
      const analysisResult = await analyzeRisk(input);
      setResult(analysisResult);
      toast({ title: 'Analysis Complete', description: 'Risk assessment has been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">AI-Powered Risk Analysis</h1>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 flex flex-col gap-8">
            <Card>
                <CardHeader>
                <CardTitle>Analysis Target</CardTitle>
                <CardDescription>Select a preset village or enter coordinates to analyze.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Preset Village</Label>
                     <Select onValueChange={handleVillageChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a village" />
                        </SelectTrigger>
                        <SelectContent>
                            {villages.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="text-center text-xs text-muted-foreground">OR</div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                    <Label htmlFor="lat">Latitude</Label>
                    <Input id="lat" value={coords.lat} onChange={(e) => setCoords({ ...coords, lat: e.target.value })} placeholder="e.g., 34.0522" />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="lon">Longitude</Label>
                    <Input id="lon" value={coords.lon} onChange={(e) => setCoords({ ...coords, lon: e.target.value })} placeholder="e.g., -118.2437" />
                    </div>
                </div>
                <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                    Analyze Risk
                </Button>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                    <CardDescription>AI-generated risk levels based on live NASA data feeds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mr-4"/>
                            <p>Analyzing data streams...</p>
                        </div>
                    )}
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                        <RiskCard title="Wildfire" icon={Flame} assessment={result?.wildfire} />
                        <RiskCard title="Heatwave" icon={Sun} assessment={result?.heatwave} />
                        <RiskCard title="Flood" icon={Waves} assessment={result?.flood} />
                        <RiskCard title="Landslide" icon={Mountain} assessment={result?.landslide} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
