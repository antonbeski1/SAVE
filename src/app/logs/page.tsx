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
import { eventLogs } from '@/lib/data';

export default function LogsPage() {
  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Event Logs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Event History</CardTitle>
          <CardDescription>
            A log of all risk computations and alert dispatches for auditing and troubleshooting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Hazard</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Alert Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.timestamp.toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{log.village}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.hazard}</Badge>
                  </TableCell>
                  <TableCell>{log.riskScore.toFixed(2)}</TableCell>
                  <TableCell>
                    {log.alertSent ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
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
