
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant, RestaurantLocation, RestaurantLocationAddress } from '@/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemoryOptimizer } from '@/utils/memory-optimizer';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface FreeMapProps {
  locations?: RestaurantLocation[];
  restaurants?: Restaurant[];
  center?: [number, number];
  userLocation?: [number, number];
  zoom?: number;
  height?: string;
  onLocationClick?: (location: RestaurantLocation) => void;
  onRestaurantClick?: (restaurant: Restaurant) => void;
}

// User location icon
const UserLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Helper component to update map view
function MapAutoCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function FreeMap({
  locations,
  restaurants,
  center = [40.7128, -74.0060], // Default NYC
  userLocation,
  zoom = 13,
  height = '400px',
  onLocationClick,
  onRestaurantClick
}: FreeMapProps) {
  const [coords, setCoords] = useState<{[key: string]: [number, number]}>({});
  const [loading, setLoading] = useState(true);
  const { scheduleCleanup } = useMemoryOptimizer();

  useEffect(() => {
    const geocodeAll = async () => {
      setLoading(true);
      const newCoords: {[key: string]: [number, number]} = {};
      
      const itemsToGeocode: {id: string, address: string}[] = [];
      
      if (locations) {
        locations.forEach(loc => {
          if (loc.latitude && loc.longitude) {
            newCoords[loc.id] = [loc.latitude, loc.longitude];
          } else {
            const addrObj = typeof loc.address === 'object' && loc.address && !Array.isArray(loc.address) ? loc.address as RestaurantLocationAddress : null;
            const addr = typeof loc.address === 'string' 
              ? `${loc.address}, ${loc.city || ''}, ${loc.state || ''} ${loc.zip || ''}`
              : `${addrObj?.street || ''}, ${addrObj?.city || ''}, ${addrObj?.state || ''} ${addrObj?.zip || ''}`;
            itemsToGeocode.push({ id: loc.id, address: addr });
          }
        });
      }
      
      if (restaurants) {
        restaurants.forEach(res => {
          const locs = res.locations || res.restaurant_locations;
          if (locs) {
            locs.forEach(loc => {
              if (loc.latitude && loc.longitude) {
                newCoords[`${res.id}-${loc.id}`] = [loc.latitude, loc.longitude];
              } else {
                const addrObj = typeof loc.address === 'object' && loc.address && !Array.isArray(loc.address) ? loc.address as RestaurantLocationAddress : null;
                const addr = typeof loc.address === 'string'
                  ? `${loc.address}, ${loc.city || ''}, ${loc.state || ''} ${loc.zip || ''}`
                  : `${addrObj?.street || ''}, ${addrObj?.city || ''}, ${addrObj?.state || ''} ${addrObj?.zip || ''}`;
                itemsToGeocode.push({ id: `${res.id}-${loc.id}`, address: addr });
              }
            });
          }
        });
      }

      // Geocode each address using Nominatim (with a delay to respect rate limits)
      for (const item of itemsToGeocode) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.address)}&limit=1`,
            {
              headers: {
                'Accept-Language': 'en'
              }
            }
          );
          const data = await response.json();
          if (data && data.length > 0) {
            newCoords[item.id] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          }
        } catch (error) {
          console.error(`Geocoding failed for ${item.address}:`, error);
        }
        // Small delay to be nice to Nominatim
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setCoords(newCoords);
      setLoading(false);
      
      // Schedule memory cleanup after geocoding heavy operations
      scheduleCleanup();
    };

    geocodeAll();
    
    // Cleanup coordinates on unmount to free memory
    return () => {
      setCoords({});
      scheduleCleanup();
    };
  }, [locations, restaurants, scheduleCleanup]);

  // Determine initial center based on user location, then first geocoded result, then default center
  const mapCenter = userLocation || (Object.values(coords).length > 0 ? Object.values(coords)[0] : center);

  return (
    <div style={{ height, width: '100%', position: 'relative' }} className="rounded-lg overflow-hidden border">
      {loading && (
        <div className="absolute inset-0 z-[1000] bg-background/50 flex items-center justify-center">
          <div className="bg-background p-3 rounded-md shadow-md flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-sm font-medium">Updating map...</span>
          </div>
        </div>
      )}
      
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapAutoCenter center={mapCenter} />

        {userLocation && (
          <Marker position={userLocation} icon={UserLocationIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {locations?.map(loc => coords[loc.id] && (
          <Marker 
            key={loc.id} 
            position={coords[loc.id]}
            eventHandlers={{
              click: () => onLocationClick?.(loc)
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-semibold">
                  {typeof loc.address === 'string' ? loc.address : (typeof loc.address === 'object' && loc.address && !Array.isArray(loc.address) ? (loc.address as RestaurantLocationAddress).street : 'Address')}
                </h3>
                <p className="text-xs text-muted-foreground">{loc.city}, {loc.state}</p>
                <div className="mt-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${loc.address}, ${loc.city}, ${loc.state}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {restaurants?.map(res => {
                  const locs = res.locations || res.restaurant_locations;
                  return locs?.map(loc => {
                    const id = `${res.id}-${loc.id}`;
                    return coords[id] && (
                      <Marker 
                        key={id} 
                        position={coords[id]}
                        eventHandlers={{
                          click: () => onRestaurantClick?.(res)
                        }}
                      >
                        <Popup>
                          <div className="p-1">
                            <h3 className="font-semibold">{res.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {typeof loc.address === 'string' ? loc.address : (typeof loc.address === 'object' && loc.address && !Array.isArray(loc.address) ? (loc.address as RestaurantLocationAddress).street : '')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {typeof loc.address === 'string' ? `${loc.city || ''}, ${loc.state || ''}` : (typeof loc.address === 'object' && loc.address && !Array.isArray(loc.address) ? `${(loc.address as RestaurantLocationAddress).city || ''}, ${(loc.address as RestaurantLocationAddress).state || ''}` : '')}
                            </p>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 mt-1 text-xs"
                              onClick={() => onRestaurantClick?.(res)}
                            >
                              View Details
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  });
                })}
      </MapContainer>
    </div>
  );
}
