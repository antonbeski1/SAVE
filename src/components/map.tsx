'use client';

import * as React from 'react';
import mapboxgl, { Map as MapboxMap, Marker, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection } from 'geojson';

// A simple mapping from event category to a color
const EONET_CATEGORY_COLORS: Record<string, string> = {
  'Wildfires': '#FF4500', // OrangeRed
  'Volcanoes': '#8B0000', // DarkRed
  'Water Color': '#1E90FF', // DodgerBlue
  'Sea and Lake Ice': '#00BFFF', // DeepSkyBlue
  'Severe Storms': '#8A2BE2', // BlueViolet
  'default': '#808080', // Gray
};

function getEventCategoryColor(category: string): string {
  return EONET_CATEGORY_COLORS[category] || EONET_CATEGORY_COLORS['default'];
}


interface MapProps {
  eonetEvents: FeatureCollection;
}

export default function Map({ eonetEvents }: MapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<MapboxMap | null>(null);
  const [lng] = React.useState(0);
  const [lat] = React.useState(20);
  const [zoom] = React.useState(1.5);
  
  // Store markers to remove them later
  const markers = React.useRef<Marker[]>([]);

  React.useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Make sure to set the Mapbox access token in your .env file
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
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [lng, lat],
      zoom: zoom,
    });
  }, [lng, lat, zoom]);

  React.useEffect(() => {
    if (!map.current || !eonetEvents) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for EONET events
    eonetEvents.features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        const { coordinates } = feature.geometry;
        const { title, category } = feature.properties as { title: string; category: string };

        // Create a custom marker element
        const el = document.createElement('div');
        el.className = 'w-3 h-3 rounded-full border-2 border-white/70 shadow-lg';
        el.style.backgroundColor = getEventCategoryColor(category);

        const popup = new Popup({ offset: 25 }).setHTML(
          `<div class="text-foreground">
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

  }, [eonetEvents]);

  return <div ref={mapContainer} className="w-full h-[60vh] rounded-lg" />;
}
