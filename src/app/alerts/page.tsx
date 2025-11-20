'use client';
import { MoreHorizontal } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { villages, type Village } from '@/lib/data';

function getRiskBadgeVariant(riskLevel: Village['riskLevel']) {
  switch (riskLevel) {
    case 'High':
      return 'destructive';
    case 'Medium':
      return 'warning';
    case 'Low':
      return 'success';
    default:
      return 'secondary';
  }
}

export default function AlertsPage() {
  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Alerts Control Center</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Village Alerts</CardTitle>
          <CardDescription>
            Manage and monitor alert statuses for all villages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Village</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Alert Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {villages.map((village) => (
                <TableRow key={village.id}>
                  <TableCell className="font-medium">{village.name}</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(village.riskLevel)}>
                      {village.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant={village.alertStatus === 'Sent' ? 'default' : 'secondary'}>
                      {village.alertStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Resend Alert</DropdownMenuItem>
                        <DropdownMenuItem>Pause Alerts</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
