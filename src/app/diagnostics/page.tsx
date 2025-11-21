'use client';

import * as React from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { fetchEonetEvents, type FetchEonetEventsOutput } from '@/ai/flows/fetch-eonet-events';
import { fetchFirmsData, type FetchFirmsDataOutput } from '@/ai/flows/fetch-firms-data';
import { fetchPowerData, type FetchPowerDataInput, type FetchPowerDataOutput } from '@/ai/flows/fetch-power-data';
import { fetchEarthImagery, type FetchEarthImageryInput, type FetchEarthImageryOutput } from '@/ai/flows/fetch-earth-imagery';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { format, subDays } from 'date-fns';

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
  const [imageryResult, setImageryResult] = React.useState<TestResult<FetchEarthImageryOutput>>({ status: 'idle' });

  const [coords, setCoords] = React.useState({ lat: '34.05', lon: '-118.25' }); // Default to Los Angeles
  const [imageryDate, setImageryDate] = React.useState(format(subDays(new Date(), 5), 'yyyy-MM-dd'));

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
        latitude: parseFloat(coords.lat),
        longitude: parseFloat(coords.lon),
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

  const runImageryTest = async () => {
    setImageryResult({ status: 'loading' });
    const startTime = Date.now();
    try {
      const input: FetchEarthImageryInput = {
        latitude: parseFloat(coords.lat),
        longitude: parseFloat(coords.lon),
        date: imageryDate,
      };
      if (isNaN(input.latitude) || isNaN(input.longitude)) {
        throw new Error('Invalid latitude or longitude.');
      }
      const result = await fetchEarthImagery(input);
      const endTime = Date.now();
      setImageryResult({ status: 'success', data: result, runtime: endTime - startTime });
      toast({ title: 'Earth Imagery Test Successful', description: `Fetched image with cloud score: ${result.cloudScore?.toFixed(2)}.` });
    } catch (error: any) {
      const endTime = Date.now();
      setImageryResult({ status: 'error', error: error.message, runtime: endTime - startTime });
      toast({ variant: 'destructive', title: 'Earth Imagery Test Failed', description: error.message });
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
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
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
              <div className="p-2 bg-muted rounded-md max-h-40 overflow-y-auto">
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
              <div className="p-2 bg-muted rounded-md max-h-40 overflow-y-auto">
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
            <CardDescription>Tests fetching hourly weather for a specific location.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="lat-power" className="text-xs">Latitude</Label>
                <Input id="lat-power" value={coords.lat} onChange={(e) => setCoords({...coords, lat: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="lon-power" className="text-xs">Longitude</Label>
                <Input id="lon-power" value={coords.lon} onChange={(e) => setCoords({...coords, lon: e.target.value})} />
              </div>
            </div>
            <Button onClick={runPowerTest} disabled={powerResult.status === 'loading'} className="w-full">
              {powerResult.status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run POWER Test
            </Button>
             {powerResult.runtime && <p className="text-xs text-muted-foreground">Runtime: {powerResult.runtime}ms</p>}
            {powerResult.status === 'success' && powerResult.data && (
              <div className="p-2 bg-muted rounded-md max-h-40 overflow-y-auto">
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

        {/* Earth Imagery Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>NASA Earth Imagery</span>
               <span className={`text-sm font-medium ${getStatusColor(imageryResult.status)}`}>
                {imageryResult.status.toUpperCase()}
              </span>
            </CardTitle>
            <CardDescription>Tests fetching a satellite image chip for a location and date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="lat-img" className="text-xs">Latitude</Label>
                <Input id="lat-img" value={coords.lat} onChange={(e) => setCoords({...coords, lat: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="lon-img" className="text-xs">Longitude</Label>
                <Input id="lon-img" value={coords.lon} onChange={(e) => setCoords({...coords, lon: e.target.value})} />
              </div>
            </div>
             <div>
                <Label htmlFor="date-img" className="text-xs">Date</Label>
                <Input id="date-img" type="date" value={imageryDate} onChange={(e) => setImageryDate(e.target.value)} />
            </div>
            <Button onClick={runImageryTest} disabled={imageryResult.status === 'loading'} className="w-full">
              {imageryResult.status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run Imagery Test
            </Button>
             {imageryResult.runtime && <p className="text-xs text-muted-foreground">Runtime: {imageryResult.runtime}ms</p>}
            {imageryResult.status === 'success' && imageryResult.data && (
              <div className="p-2 bg-muted rounded-md space-y-2">
                <Image src={imageryResult.data.imageDataUri} alt="Satellite imagery chip" width={500} height={500} className="rounded-md w-full h-auto" />
                <p className="text-xs text-muted-foreground">Cloud score: {imageryResult.data.cloudScore?.toFixed(3) ?? 'N/A'}</p>
              </div>
            )}
             {imageryResult.status === 'error' && (
              <div className="p-2 bg-destructive/20 text-red-300 rounded-md">
                <p className="text-xs font-mono">{imageryResult.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
