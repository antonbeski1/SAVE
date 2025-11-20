import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud } from 'lucide-react';

export default function GroundTruthPage() {
  return (
    <AppLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Ground Truth Input</h1>
      </div>
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Report an Event</CardTitle>
          <CardDescription>
            Submit on-the-ground observations to help improve our risk models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="village">Village Name</Label>
                <Input id="village" placeholder="e.g., Riverside" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hazard-type">Hazard Type</Label>
                <Select>
                  <SelectTrigger id="hazard-type">
                    <SelectValue placeholder="Select hazard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="landslide">Landslide</SelectItem>
                    <SelectItem value="heatwave">Heatwave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">GPS Location (Optional)</Label>
              <div className="flex gap-2">
                <Input id="location" placeholder="e.g., 18.5204, 73.8567" />
                <Button variant="outline" type="button">Get Current Location</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Upload Images</Label>
              <div className="flex items-center justify-center w-full">
                <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, or GIF (MAX. 800x400px)</p>
                    </div>
                    <Input id="dropzone-file" type="file" className="hidden" />
                </Label>
              </div> 
            </div>
             <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the event, e.g., water level, affected areas." />
            </div>
            <Button type="submit" className="w-full">Submit Report</Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
