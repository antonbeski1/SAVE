import { AppLayout } from '@/components/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const scheduledJobs = [
  { id: 'job-01', job: 'Rainfall ingest', frequency: 'hourly', api: 'POWER' },
  { id: 'job-02', job: 'Temperature ingest', frequency: 'hourly', api: 'POWER' },
  { id: 'job-03', job: 'Fire data ingest', frequency: '10 min', api: 'FIRMS' },
  { id: 'job-04', job: 'Satellite image chip fetch', frequency: 'daily', api: 'Earth Imagery' },
  { id: 'job-05', job: 'Hazard event sync', frequency: 'hourly', api: 'EONET' },
  { id: 'job-06', job: 'Raster ingestion', frequency: 'daily', api: 'GIBS' },
  { id: 'job-07', job: 'ML risk run', frequency: 'hourly', api: '—' },
  { id: 'job-08', job: 'Alert engine', frequency: 'hourly', api: '—' },
];

export default function AutomationPage() {
  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Automation Pipeline</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Jobs</CardTitle>
          <CardDescription>
            This table outlines the automated data ingestion and processing jobs that run on the backend to power the SAVE platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>NASA API</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledJobs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.job}</TableCell>
                  <TableCell>{item.frequency}</TableCell>
                  <TableCell>
                    {item.api === '—' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Badge variant="outline">{item.api}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
