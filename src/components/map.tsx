'use client';

import * as React from 'react';
import mapboxgl, { Map as MapboxMap, Marker, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection } from 'geojson';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays } from 'date-fns';

const EONET_CATEGORY_COLORS: Record<string, string> = {
  Wildfires: '#FF4500',
  Volcanoes: '#8B0000',
  'Water Color': '#1E90FF',
  'Sea and Lake Ice': '#00BFFF',
  'Severe Storms': '#8A2BE2',
  Floods: '#0000FF',
  Landslides: '#A0522D',
  Drought: '#F4A460',
  'Dust and Haze': '#BDB76B',
  'Manmade': '#696969',
  TemperatureExtremes: '#FFD700',
  Snow: '#FFFAFA',
  default: '#808080',
};

const GIBS_LAYERS = [
    { id: 'MODIS_Terra_CorrectedReflectance_TrueColor', name: 'True Color (Terra)' },
    { id: 'VIIRS_SNPP_CorrectedReflectance_TrueColor', name: 'True Color (VIIRS)' },
    { id: 'MODIS_Terra_Land_Surface_Temp_Day', name: 'Land Surface Temp (Day)' },
    { id: 'VIIRS_SNPP_DayNightBand_ENCC', name: 'Night Lights' },
    { id: 'MODIS_Terra_Aerosol_Optical_Depth', name: 'Aerosol Optical Depth' },
    { id: 'MODIS_Terra_Cloud_Top_Temperature_Day', name: 'Cloud Top Temperature' },
    { id: 'MODIS_Terra_Water_Mask', name: 'Flood Water Mask (MODIS)' },
    { id: 'VIIRS_SNPP_Flood_NRT', name: 'Flood Water NRT (VIIRS)'},
    { id: 'VIIRS_NOAA20_NRT_Fires_375m_Day', name: 'Fires (VIIRS, Day)' },
    { id: 'VIIRS_NOAA20_NRT_Fires_375m_Night', name: 'Fires (VIIRS, Night)' },
];

function getEventCategoryColor(category: string): string {
  return EONET_CATEGORY_COLORS[category] || EONET_CATEGORY_COLORS['default'];
}

interface MapProps {
  eonetEvents: FeatureCollection;
  firmsEvents: FeatureCollection;
}


export default function Map({ eonetEvents, firmsEvents }: MapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<MapboxMap | null>(null);
  const [lng] = React.useState(0);
  const [lat] = React.useState(20);
  const [zoom] = React.useState(1.5);
  
  const markers = React.useRef<Marker[]>([]);
  const [opacity, setOpacity] = React.useState(0.8);
  const [selectedDate, setSelectedDate] = React.useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedLayer, setSelectedLayer] = React.useState(GIBS_LAYERS[0].id);

  // Use a relative path to our backend proxy. The API key is handled on the server.
  const tileUrl = `/api/gibs/${selectedLayer}/default/${selectedDate}/500m/{z}/{y}/{x}.jpg`;

  React.useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapboxAccessToken || mapboxAccessToken === "YOUR_MAPBOX_ACCESS_TOKEN_HERE") {
        console.error("Mapbox access token is not set. Please add it to your .env file.");
        if(mapContainer.current) {
          mapContainer.current.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-muted-foreground/10 text-muted-foreground">Please set your Mapbox access token in the .env file.</div>`;
        }
        return;
    }
    mapboxgl.accessToken = mapboxAccessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark style provides better contrast
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('load', () => {
       map.current?.addSource('gibs-tiles', {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256
      });
      map.current?.addLayer({
        id: 'gibs-layer',
        type: 'raster',
        source: 'gibs-tiles',
        paint: {
          'raster-opacity': opacity
        }
      });
    });

  }, [lng, lat, zoom, tileUrl]); // Removed dependencies that are now handled by other effects

  React.useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;

    const gibsSource = map.current.getSource('gibs-tiles') as mapboxgl.RasterSource;
    if (gibsSource) {
      gibsSource.setTiles([tileUrl]);
      const gibsLayer = map.current.getLayer('gibs-layer');
      if (gibsLayer) {
        map.current.setPaintProperty('gibs-layer', 'raster-opacity', opacity);
      } else {
         map.current?.addLayer({
            id: 'gibs-layer',
            type: 'raster',
            source: 'gibs-tiles',
            paint: {
              'raster-opacity': opacity
            }
          });
      }
    }
  }, [opacity, selectedDate, selectedLayer, tileUrl]);

  React.useEffect(() => {
    if (!map.current || !eonetEvents || !firmsEvents) return;
    
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for EONET events
    eonetEvents.features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        const { coordinates } = feature.geometry;
        const props = feature.properties as { title: string; category: string, date: string };

        const el = document.createElement('div');
        el.className = 'w-3 h-3 rounded-full border-2 border-white/70 shadow-lg cursor-pointer';
        el.style.backgroundColor = getEventCategoryColor(props.category);
        el.title = props.title;

        const popup = new Popup({ offset: 25, className: 'mapbox-popup-custom' }).setHTML(
          `<div>
            <h3 class="font-bold text-base flex items-center"><div class="w-2 h-2 rounded-full mr-2" style="background-color: ${getEventCategoryColor(props.category)}"></div>${props.title}</h3>
            <p class="text-sm"><span class="font-semibold">Category:</span> ${props.category}</p>
            ${props.date ? `<p class="text-xs text-muted-foreground">Date: ${new Date(props.date).toLocaleDateString()}</p>` : ''}
          </div>`
        );

        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(coordinates as [number, number])
          .setPopup(popup)
          .addTo(map.current!);
          
        markers.current.push(newMarker);
      }
    });

    // Add markers for FIRMS fire data
    firmsEvents.features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        const { coordinates } = feature.geometry;
        const { brightness, confidence } = feature.properties as { brightness: number; confidence: string };

        const el = document.createElement('div');
        
        // Normalize brightness (Kelvin) to a 0-1 scale for styling.
        // Typical wildfire brightness can be 300K (low) to over 500K (high).
        const fireIntensity = Math.min(1, Math.max(0, (brightness - 300) / 200));

        const size = 6 + fireIntensity * 10; // size from 6px to 16px
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = '50%';
        el.style.backgroundColor = `hsl(15, 100%, ${60 - fireIntensity * 20}%)`; // Orange to bright red
        el.style.border = '1px solid rgba(255, 255, 255, 0.5)';
        el.style.boxShadow = `0 0 ${2 + fireIntensity * 6}px hsl(30, 100%, 50%)`;
        el.style.opacity = (confidence === 'high' ? '1' : (confidence === 'nominal' ? '0.8' : '0.6'));
        el.className = 'cursor-pointer';

        const popup = new Popup({ offset: 15, className: 'mapbox-popup-custom' }).setHTML(
          `<div>
            <h3 class="font-bold text-base text-red-400">Active Fire</h3>
            <p class="text-sm"><span class="font-semibold">Brightness:</span> ${brightness.toFixed(0)}K</p>
            <p class="text-sm"><span class="font-semibold">Confidence:</span> ${confidence}</p>
          </div>`
        );

        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(coordinates as [number, number])
          .setPopup(popup)
          .addTo(map.current!);
          
        markers.current.push(newMarker);
      }
    });


  }, [eonetEvents, firmsEvents]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[65vh] rounded-lg" />
      <Card className="absolute bottom-4 left-4 z-10 w-64 bg-background/80 backdrop-blur-sm p-4">
        <div className="space-y-4">
            <div>
              <Label htmlFor="layer-select" className="text-xs">Satellite Layer</Label>
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger id="layer-select">
                    <SelectValue placeholder="Select a layer" />
                </SelectTrigger>
                <SelectContent>
                    {GIBS_LAYERS.map(layer => (
                        <SelectItem key={layer.id} value={layer.id}>{layer.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-slider" className="text-xs">Satellite Date</Label>
              <Input 
                id="date-slider"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(subDays(new Date(), 1), 'yyyy-MM-dd')} // GIBS data is usually a day behind
              />
            </div>
            <div>
              <Label htmlFor="opacity-slider" className="text-xs">Satellite Opacity ({Math.round(opacity * 100)}%)</Label>
              <Slider
                id="opacity-slider"
                min={0}
                max={1}
                step={0.05}
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
              />
            </div>
        </div>
      </Card>
    </div>
  );
}
