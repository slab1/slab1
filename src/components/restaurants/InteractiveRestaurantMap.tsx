import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RestaurantLocation, RestaurantLocationAddress } from '@/api/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Car, Landmark, Locate, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

const UserLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

interface InteractiveRestaurantMapProps {
  location: RestaurantLocation;
  height?: string;
  zoom?: number;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function InteractiveRestaurantMap({
  location,
  height = '400px',
  zoom = 15
}: InteractiveRestaurantMapProps) {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTargetCoords = async () => {
      if (location.latitude && location.longitude) {
        const coords: [number, number] = [location.latitude, location.longitude];
        setTargetCoords(coords);
        setMapCenter(coords);
        return;
      }

      // Geocode address if coordinates are missing
      let addr = '';
      if (typeof location.address === 'string') {
        addr = location.address;
      } else if (typeof location.address === 'object' && location.address !== null) {
        const addressObj = location.address as RestaurantLocationAddress;
        addr = `${addressObj.street || ''}, ${addressObj.city || ''}, ${addressObj.state || ''} ${addressObj.zip || ''}`;
      }
      
      if (!addr || addr.trim() === ', ,') {
        setError("Location address not available");
        return;
      }
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`);
        const data = await response.json();
        if (data && data[0]) {
          const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setTargetCoords(coords);
          setMapCenter(coords);
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
        setError("Could not find location on map");
      }
    };

    getTargetCoords();
  }, [location]);

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserCoords(coords);
          setMapCenter(coords);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Could not access your location");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const getDirectionsUrl = () => {
    if (!targetCoords) return "#";
    const [lat, lng] = targetCoords;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  if (!targetCoords && !error) {
    return (
      <Card style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="relative" style={{ height }}>
          {targetCoords && (
            <MapContainer 
              center={targetCoords} 
              zoom={zoom} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={targetCoords} icon={DefaultIcon}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold">{location.city || 'Our Location'}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeof location.address === 'string' 
                        ? location.address 
                        : typeof location.address === 'object' && location.address !== null
                          ? (location.address as RestaurantLocationAddress).street
                          : ''}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {userCoords && (
                <>
                  <Marker position={userCoords} icon={UserLocationIcon} />
                  <Circle 
                    center={userCoords} 
                    radius={100} 
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} 
                  />
                </>
              )}

              <MapUpdater center={mapCenter || targetCoords} zoom={zoom} />
            </MapContainer>
          )}

          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full shadow-lg bg-white/90 hover:bg-white"
              onClick={handleLocateUser}
              aria-label="Locate me"
              title="Locate me"
            >
              <Locate className="h-4 w-4" />
            </Button>
            <Button 
              asChild
              size="icon" 
              variant="default" 
              className="rounded-full shadow-lg"
              aria-label="Get directions in Google Maps"
              title="Get directions"
            >
              <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Parking Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {location.parking_info || "Valet parking available and street parking nearby. Closest parking garage is located 2 blocks north on 5th Ave."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              Nearby Landmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(location.landmarks || ["Central Park", "Metropolitan Museum", "Times Square"]).map((landmark, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  {landmark}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Google Maps
          </a>
        </Button>
      </div>
    </div>
  );
}
