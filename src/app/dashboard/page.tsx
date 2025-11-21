import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { villages } from '@/lib/data';
import { AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { fetchEonetEvents } from '@/ai/flows/fetch-eonet-events';
import { fetchFirmsData } from '@/ai/flows/fetch-firms-data';
import Map from '@/components/map';
import type { FeatureCollection } from 'geojson';

export default async function DashboardPage() {
  const highRiskVillages = villages.filter((v) => v.riskLevel === 'High').length;
  const activeAlerts = villages.filter((v) => v.alertStatus === 'Sent').length;

  const { events } = await fetchEonetEvents();
  const { firePoints } = await fetchFirmsData();

  // Convert EONET events to GeoJSON format for the map
  const eonetGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features: events.map(event => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: event.coordinates,
      },
      properties: {
        id: event.id,
        title: event.title,
        category: event.category,
      },
    })),
  };

  const firmsGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features: firePoints.map(point => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        brightness: point.brightness,
        confidence: point.confidence,
      },
    })),
  };


  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Risk Map Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Villages</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskVillages}</div>
            <p className="text-xs text-muted-foreground">Currently in red zone</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <ShieldCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Villages notified in the last 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NASA EONET Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Live global natural events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NASA FIRMS Fires (24h)</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firePoints.length}</div>
            <p className="text-xs text-muted-foreground">Live global fire detections</p>
          </CardContent>
        </Card>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Global Risk Map</CardTitle>
          <CardDescription>Live hazard data from NASA EONET and FIRMS, with satellite imagery from GIBS.</CardDescription>
          <CardContent className="p-0">
            <Map eonetEvents={eonetGeoJson} firmsEvents={firmsGeoJson} />
          </CardContent>
        </CardHeader>
      </Card>
    </AppLayout>
  );
}
