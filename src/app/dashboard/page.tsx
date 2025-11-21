import Image from 'next/image';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { villages } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';
import { fetchEonetEvents } from '@/ai/flows/fetch-eonet-events';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// A simple mapping from event category to a color
function getEventCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case 'wildfires':
      return 'bg-red-500';
    case 'volcanoes':
      return 'bg-orange-500';
    case 'water color':
      return 'bg-blue-500';
    case 'sea and lake ice':
      return 'bg-cyan-300';
    case 'severe storms':
      return 'bg-purple-500';
    default:
      return 'bg-gray-400';
  }
}

export default async function DashboardPage() {
  const highRiskVillages = villages.filter((v) => v.riskLevel === 'High').length;
  const activeAlerts = villages.filter((v) => v.alertStatus === 'Sent').length;
  const pausedAlerts = villages.filter((v) => v.alertStatus === 'Paused').length;
  const mapPlaceholder = PlaceHolderImages.find(p => p.id === 'map-placeholder');
  const { events } = await fetchEonetEvents();

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
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>District Risk Map & NASA EONET Live Events</CardTitle>
          <CardDescription>
            Color-coded markers indicate village risk levels and live NASA hazard events. Hover for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border">
              {mapPlaceholder && (
                <Image
                  src={mapPlaceholder.imageUrl}
                  alt={mapPlaceholder.description}
                  fill
                  className="object-cover"
                  data-ai-hint={mapPlaceholder.imageHint}
                  priority
                />
              )}
              {events.map((event) => {
                const [lon, lat] = event.coordinates;
                // Simple equirectangular projection
                const left = (lon + 180) / 360 * 100;
                const top = (90 - lat) / 180 * 100;

                return (
                  <Tooltip key={event.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 shadow-lg"
                        style={{ top: `${top}%`, left: `${left}%`, backgroundColor: getEventCategoryColor(event.category) }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">Category: {event.category}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
