import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ModelsPage() {
  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Model Registry</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Risk Models</CardTitle>
          <CardDescription>
            Manage risk model versions, view changelogs, and perform rollbacks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
            <p className="text-muted-foreground">Model registry and versioning controls will be available here. Feature under development.</p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
