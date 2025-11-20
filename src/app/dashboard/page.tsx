import Image from 'next/image';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { villages } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';

export default function DashboardPage() {
  const highRiskVillages = villages.filter((v) => v.riskLevel === 'High').length;
  const activeAlerts = villages.filter((v) => v.alertStatus === 'Sent').length;
  const pausedAlerts = villages.filter((v) => v.alertStatus === 'Paused').length;
  const mapPlaceholder = PlaceHolderImages.find(p => p.id === 'map-placeholder');

  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Risk Map Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Villages</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskVillages}</div>
            <p className="text-xs text-muted-foreground">Currently in red zone</p>d
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
            <CardTitle className="text-sm font-medium">Paused Alerts</CardTitle>
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pausedAlerts}</div>
            <p className="text-xs text-muted-foreground">Notifications manually paused</p>
          </CardContent>
        </Card>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>District Risk Map</CardTitle>
          <CardDescription>
            Color-coded markers indicate village risk levels. Click on a marker for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border">
            {mapPlaceholder && (
              <Image
                src={mapPlaceholder.imageUrl}
                alt={mapPlaceholder.description}
                fill
                className="object-cover"
                data-ai-hint={mapPlaceholder.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center">
              <p className="text-lg font-medium text-foreground bg-background/80 px-4 py-2 rounded-md">
                Interactive Map Will Be Rendered Here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
