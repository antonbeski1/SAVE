import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OverridesPage() {
  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Manual Override Panel</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Overrides</CardTitle>
          <CardDescription>
            This section allows administrators to manually adjust risk scores, force alerts, or pause notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
            <p className="text-muted-foreground">Manual override controls will be available here. Feature under development.</p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
