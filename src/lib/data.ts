export type Village = {
  id: string;
  name: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  alertStatus: 'Sent' | 'Paused' | 'Inactive';
  coords: { lat: number; lon: number };
};

export const villages: Village[] = [
  { id: 'v001', name: 'Riverside', riskLevel: 'High', alertStatus: 'Sent', coords: { lat: 34.0522, lon: -118.2437 } },
  { id: 'v002', name: 'Hillview', riskLevel: 'Medium', alertStatus: 'Sent', coords: { lat: 40.7128, lon: -74.0060 } },
  { id: 'v003', name: 'Greenfield', riskLevel: 'Low', alertStatus: 'Inactive', coords: { lat: 35.6895, lon: 139.6917 } },
  { id: 'v004', name: 'Laketown', riskLevel: 'High', alertStatus: 'Paused', coords: { lat: -33.8688, lon: 151.2093 } },
  { id: 'v005', name: 'Sunnyside', riskLevel: 'Low', alertStatus: 'Inactive', coords: { lat: 19.4326, lon: -99.1332 } },
  { id: 'v006', name: 'Mountain Base', riskLevel: 'Medium', alertStatus: 'Sent', coords: { lat: 48.8566, lon: 2.3522 } },
  { id: 'v007', name: 'Coastal Point', riskLevel: 'Low', alertStatus: 'Inactive', coords: { lat: -22.9068, lon: -43.1729 } },
];

export type EventLog = {
  id: string;
  timestamp: Date;
  village: string;
  hazard: 'Flood' | 'Landslide' | 'Heatwave';
  riskScore: number;
  alertSent: boolean;
};

export const eventLogs: EventLog[] = [
  { id: 'e001', timestamp: new Date('2024-07-21T14:30:00Z'), village: 'Riverside', hazard: 'Flood', riskScore: 0.85, alertSent: true },
  { id: 'e002', timestamp: new Date('2024-07-21T13:05:00Z'), village: 'Hillview', hazard: 'Landslide', riskScore: 0.65, alertSent: true },
  { id: 'e003', timestamp: new Date('2024-07-21T11:00:00Z'), village: 'Laketown', hazard: 'Flood', riskScore: 0.92, alertSent: false },
  { id: 'e004', timestamp: new Date('2024-07-20T18:00:00Z'), village: 'Sunnyside', hazard: 'Heatwave', riskScore: 0.78, alertSent: true },
  { id: 'e005', timestamp: new Date('2024-07-20T16:45:00Z'), village: 'Mountain Base', hazard: 'Landslide', riskScore: 0.55, alertSent: true },
];

export type UserGroup = {
  id: string;
  name: string;
  villageCount: number;
  hazards: ('Flood' | 'Landslide' | 'Heatwave')[];
};

export const userGroups: UserGroup[] = [
  { id: 'ug01', name: 'Northern District', villageCount: 12, hazards: ['Flood', 'Landslide'] },
  { id: 'ug02', name: 'Coastal Alliance', villageCount: 8, hazards: ['Flood', 'Heatwave'] },
  { id: 'ug03', name: 'Highlands Watch', villageCount: 5, hazards: ['Landslide'] },
  { id: 'ug04', name: 'Southern Plains', villageCount: 22, hazards: ['Heatwave', 'Flood'] },
];

export type Diagnostic = {
  id: string;
  name: string;
  lastRun: string;
  status: 'Ok' | 'Error' | 'Pending';
  details: string;
};

export const diagnostics: Diagnostic[] = [
  { id: 'd01', name: 'GPM Rainfall Fetch', lastRun: '5 minutes ago', status: 'Ok', details: 'Fetched 1.2GB of data successfully.' },
  { id: 'd02', name: 'Sentinel-1 SAR Sync', lastRun: '3 hours ago', status: 'Ok', details: 'Latest imagery synced.' },
  { id: 'd03', name: 'Temperature Forecasts', lastRun: '1 hour ago', status: 'Warning', details: 'Source API has high latency.' },
  { id: 'd04', name: 'Risk Score Computation', lastRun: '6 minutes ago', status: 'Ok', details: 'All villages updated.' },
  { id: 'd05', name: 'WhatsApp Alert Queue', lastRun: '1 minute ago', status: 'Ok', details: '0 messages pending.' },
  { id: 'd06', name: 'Raster Processing', lastRun: '3 hours ago', status: 'Error', details: 'DEM clipping failed for region 7.' },
];
