'use client';

import * as React from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { fetchEonetEvents, type FetchEonetEventsOutput } from '@/ai/flows/fetch-eonet-events';
import { fetchFirmsData, type FetchFirmsDataOutput } from '@/ai/flows/fetch-firms-data';
import { fetchPowerData, type FetchPowerDataInput, type FetchPowerDataOutput } from '@/ai/flows/fetch-power-data';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TestResult<T> = {
  status: 'success' | 'error' | 'idle' | 'loading';
  data?: T;
  error?: string;
  runtime?: number;
};

export default function DiagnosticsPage() {
  const { toast } = useToast();
  const [eonetResult, setEonetResult] = React.useState<TestResult<FetchEonetEventsOutput>>({ status: 'idle' });
  const [firmsResult, setFirmsResult] = React.useState<TestResult<FetchFirmsDataOutput>>({ status: 'idle' });
  const [powerResult, setPowerResult] = React.useState<TestResult<FetchPowerDataOutput>>({ status: 'idle' });
  const [powerCoords, setPowerCoords] = React.useState({ lat: '34.05', lon: '-118.25' }); // Default to Los Angeles

  const runEonetTest = async () => {
    setEonetResult({ status: 'loading' });
    const startTime = Date.now();
    try {
      const result = await fetchEonetEvents();
      const endTime = Date.now();
      setEonetResult({ status: 'success', data: result, runtime: endTime - startTime });
      toast({ title: 'EONET Test Successful', description: `Fetched ${result.events.length} events.` });
    } catch (error: any) {
      const endTime = Date.now();
      setEonetResult({ status: 'error', error: error.message, runtime: endTime - startTime });
      toast({ variant: 'destructive', title: 'EONET Test Failed', description: error.message });
    }
  };

  const runFirmsTest = async () => {
    setFirmsResult({ status: 'loading' });
    const startTime = Date.now();
    try {
      const result = await fetchFirmsData();
       const endTime = Date.now();
      setFirmsResult({ status: 'success', data: result, runtime: endTime - startTime });
      toast({ title: 'FIRMS Test Successful', description: `Fetched ${result.firePoints.length} fire points.` });
    } catch (error: any) {
       const endTime = Date.now();
      setFirmsResult({ status: 'error', error: error.message, runtime: endTime - startTime });
      toast({ variant: 'destructive', title: 'FIRMS Test Failed', description: error.message });
    }
  };

  const runPowerTest = async () => {
    setPowerResult({ status: 'loading' });
    const startTime = Date.now();
    try {
       const input: FetchPowerDataInput = {
        latitude: parseFloat(powerCoords.lat),
        longitude: parseFloat(powerCoords.lon),
      };
      if (isNaN(input.latitude) || isNaN(input.longitude)) {
        throw new Error('Invalid latitude or longitude.');
      }
      const result = await fetchPowerData(input);
      const endTime = Date.now();
      setPowerResult({ status: 'success', data: result, runtime: endTime - startTime });
      toast({ title: 'POWER Test Successful', description: `Fetched ${result.data.length} hourly data points.` });
    } catch (error: any) {
      const endTime = Date.now();
      setPowerResult({ status: 'error', error: error.message, runtime: endTime - startTime });
      toast({ variant: 'destructive', title: 'POWER Test Failed', description: error.message });
    }
  };
  
  const getStatusColor = (status: TestResult<any>['status']) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'loading': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Data Source Diagnostics</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* EONET Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>NASA EONET Events</span>
              <span className={`text-sm font-medium ${getStatusColor(eonetResult.status)}`}>
                {eonetResult.status.toUpperCase()}
              </span>
            </CardTitle>
            <CardDescription>Tests fetching open natural hazard events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runEonetTest} disabled={eonetResult.status === 'loading'} className="w-full">
              {eonetResult.status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run EONET Test
            </Button>
            {eonetResult.runtime && <p className="text-xs text-muted-foreground">Runtime: {eonetResult.runtime}ms</p>}
            {eonetResult.status === 'success' && eonetResult.data && (
              <div className="p-2 bg-muted rounded-md max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(eonetResult.data.events.slice(0, 2), null, 2)}</pre>
                <p className="text-center text-xs mt-2">Showing 2 of {eonetResult.data.events.length} events.</p>
              </div>
            )}
            {eonetResult.status === 'error' && (
              <div className="p-2 bg-destructive/20 text-red-300 rounded-md">
                <p className="text-xs font-mono">{eonetResult.error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FIRMS Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>NASA FIRMS Fires (24h)</span>
               <span className={`text-sm font-medium ${getStatusColor(firmsResult.status)}`}>
                {firmsResult.status.toUpperCase()}
              </span>
            </CardTitle>
            <CardDescription>Tests fetching active fire locations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runFirmsTest} disabled={firmsResult.status === 'loading'} className="w-full">
              {firmsResult.status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run FIRMS Test
            </Button>
             {firmsResult.runtime && <p className="text-xs text-muted-foreground">Runtime: {firmsResult.runtime}ms</p>}
            {firmsResult.status === 'success' && firmsResult.data && (
              <div className="p-2 bg-muted rounded-md max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(firmsResult.data.firePoints.slice(0, 5), null, 2)}</pre>
                <p className="text-center text-xs mt-2">Showing 5 of {firmsResult.data.firePoints.length} points.</p>
              </div>
            )}
             {firmsResult.status === 'error' && (
              <div className="p-2 bg-destructive/20 text-red-300 rounded-md">
                <p className="text-xs font-mono">{firmsResult.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* POWER Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>NASA POWER Weather</span>
               <span className={`text-sm font-medium ${getStatusColor(powerResult.status)}`}>
                {powerResult.status.toUpperCase()}
              </span>
            </CardTitle>
            <CardDescription>Tests fetching hourly weather for a location.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="lat" className="text-xs">Latitude</Label>
                <Input id="lat" value={powerCoords.lat} onChange={(e) => setPowerCoords({...powerCoords, lat: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="lon" className="text-xs">Longitude</Label>
                <Input id="lon" value={powerCoords.lon} onChange={(e) => setPowerCoords({...powerCoords, lon: e.target.value})} />
              </div>
            </div>
            <Button onClick={runPowerTest} disabled={powerResult.status === 'loading'} className="w-full">
              {powerResult.status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run POWER Test
            </Button>
             {powerResult.runtime && <p className="text-xs text-muted-foreground">Runtime: {powerResult.runtime}ms</p>}
            {powerResult.status === 'success' && powerResult.data && (
              <div className="p-2 bg-muted rounded-md max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(powerResult.data.data.slice(0, 3), null, 2)}</pre>
                <p className="text-center text-xs mt-2">Showing 3 of {powerResult.data.data.length} hourly records.</p>
              </div>
            )}
             {powerResult.status === 'error' && (
              <div className="p-2 bg-destructive/20 text-red-300 rounded-md">
                <p className="text-xs font-mono">{powerResult.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}