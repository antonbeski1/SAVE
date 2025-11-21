'use client';

import * as React from 'react';
import mapboxgl, { Map as MapboxMap, Marker, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection } from 'geojson';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { format, subDays } from 'date-fns';

const EONET_CATEGORY_COLORS: Record<string, string> = {
  Wildfires: '#FF4500',
  Volcanoes: '#8B0000',
  'Water Color': '#1E90FF',
  'Sea and Lake Ice': '#00BFFF',
  'Severe Storms': '#8A2BE2',
  default: '#808080',
};

function getEventCategoryColor(category: string): string {
  return EONET_CATEGORY_COLORS[category] || EONET_CATEGORY_COLORS['default'];
}

interface MapProps {
  eonetEvents: FeatureCollection;
  firmsEvents: FeatureCollection;
}

const GIBSTileLayer = 'MODIS_Terra_CorrectedReflectance_TrueColor';

export default function Map({ eonetEvents, firmsEvents }: MapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<MapboxMap | null>(null);
  const [lng] = React.useState(0);
  const [lat] = React.useState(20);
  const [zoom] = React.useState(1.5);
  
  const markers = React.useRef<Marker[]>([]);
  const [opacity, setOpacity] = React.useState(1);
  const [selectedDate, setSelectedDate] = React.useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));

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
        tiles: [
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${GIBSTileLayer}/default/${selectedDate}/250m/{z}/{y}/{x}.jpg`
        ],
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

  }, [lng, lat, zoom, opacity, selectedDate]);

  React.useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;

    const gibsSource = map.current.getSource('gibs-tiles') as mapboxgl.RasterSource;
    if (gibsSource) {
      gibsSource.setTiles([`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${GIBSTileLayer}/default/${selectedDate}/250m/{z}/{y}/{x}.jpg`]);
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
  }, [opacity, selectedDate]);

  React.useEffect(() => {
    if (!map.current || !eonetEvents || !firmsEvents) return;
    
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for EONET events
    eonetEvents.features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        const { coordinates } = feature.geometry;
        const { title, category } = feature.properties as { title: string; category: string };

        const el = document.createElement('div');
        el.className = 'w-3 h-3 rounded-full border-2 border-white/70 shadow-lg';
        el.style.backgroundColor = getEventCategoryColor(category);

        const popup = new Popup({ offset: 25, className: 'mapbox-popup-custom' }).setHTML(
          `<div>
            <h3 class="font-bold">${title}</h3>
            <p class="text-sm text-muted-foreground">${category}</p>
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
        el.className = `w-2 h-2 rounded-full border border-white/50`;
        const fireIntensity = (brightness - 300) / 200; // Normalize brightness
        el.style.backgroundColor = `rgba(255, 0, 0, ${Math.max(0.4, fireIntensity)})`;
        el.style.boxShadow = `0 0 4px rgba(255, 100, 0, ${Math.max(0.6, fireIntensity)})`;

        const popup = new Popup({ offset: 15, className: 'mapbox-popup-custom' }).setHTML(
          `<div>
            <h3 class="font-bold">Active Fire</h3>
            <p class="text-sm text-muted-foreground">Brightness: ${brightness}K</p>
            <p class="text-sm text-muted-foreground">Confidence: ${confidence}</p>
          </div>`
        );

        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(coordinates as [number, number])
          .setPopup(popup)
          .addTo(map.current!);
          
        markers.current.push(newMarker);
      }
    });


  }, [eonetEvents, firmsEvents, opacity, selectedDate]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[65vh] rounded-lg" />
      <Card className="absolute bottom-4 left-4 z-10 w-64 bg-background/80 backdrop-blur-sm p-4">
        <div className="space-y-4">
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
