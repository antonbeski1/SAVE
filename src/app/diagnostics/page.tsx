import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { diagnostics } from '@/lib/data';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusIcons = {
  Ok: <CheckCircle2 className="h-6 w-6 text-success" />,
  Warning: <AlertCircle className="h-6 w-6 text-warning" />,
  Error: <XCircle className="h-6 w-6 text-destructive" />,
  Pending: <AlertCircle className="h-6 w-6 text-muted-foreground" />,
};

const statusColors = {
  Ok: 'border-green-200 dark:border-green-800',
  Warning: 'border-yellow-200 dark:border-yellow-800',
  Error: 'border-red-200 dark:border-red-800',
  Pending: 'border-gray-200 dark:border-gray-700',
};

export default function DiagnosticsPage() {
  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Data Diagnostics</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {diagnostics.map((item) => (
          <Card key={item.id} className={cn('flex flex-col', statusColors[item.status as keyof typeof statusColors] ?? '')}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-medium">{item.name}</CardTitle>
                {statusIcons[item.status as keyof typeof statusIcons]}
              </div>
              <CardDescription>Last run: {item.lastRun}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{item.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
