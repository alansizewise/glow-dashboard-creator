
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

interface MapSectionProps {
  filters: {
    startDate: string;
    endDate: string;
    tenantId: string;
    countryCode: string;
    minAge: number;
    maxAge: number;
    gender: string;
  };
}

// This would normally come from an environment variable
// For a production app, you should use proper environment variable handling
const MAPBOX_TOKEN = "pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNrbTl3ZDQ1dDE5eGoydnBnZzU5bHVvcXcifQ.mZZA7PAFK3GJsnKQFWT6DA";

// Mock data for locations - in a real app, this would come from your backend
const generateMockLocations = () => {
  const locations = [
    { name: "London, UK", lat: 51.507351, lng: -0.127758, count: Math.floor(Math.random() * 100) + 50 },
    { name: "Manchester, UK", lat: 53.480759, lng: -2.242631, count: Math.floor(Math.random() * 100) + 30 },
    { name: "Birmingham, UK", lat: 52.486243, lng: -1.890401, count: Math.floor(Math.random() * 100) + 25 },
    { name: "Edinburgh, UK", lat: 55.953251, lng: -3.188267, count: Math.floor(Math.random() * 100) + 20 },
    { name: "Glasgow, UK", lat: 55.860916, lng: -4.251433, count: Math.floor(Math.random() * 100) + 15 },
    { name: "New York, US", lat: 40.712776, lng: -74.005974, count: Math.floor(Math.random() * 100) + 80 },
    { name: "Los Angeles, US", lat: 34.052235, lng: -118.243683, count: Math.floor(Math.random() * 100) + 65 },
    { name: "Chicago, US", lat: 41.878113, lng: -87.629799, count: Math.floor(Math.random() * 100) + 45 },
    { name: "Miami, US", lat: 25.761681, lng: -80.191788, count: Math.floor(Math.random() * 100) + 55 },
    { name: "Boston, US", lat: 42.360082, lng: -71.058880, count: Math.floor(Math.random() * 100) + 40 },
  ];
  return locations;
};

const mockLocations = generateMockLocations();

const MapSection = ({ filters }: MapSectionProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationData, setLocationData] = useState<any[]>([]);

  // Function to filter locations based on filters (mock implementation)
  const filterLocations = (locations: any[], filters: MapSectionProps["filters"]) => {
    // In a real implementation, you would filter based on the actual filters
    // For this mock, we'll just return all locations
    return locations;
  };

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 40], // Center the map between US and UK
      zoom: 2,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when filters change
  useEffect(() => {
    setIsLoading(true);

    // Simulate API fetch delay
    const timer = setTimeout(() => {
      const filteredLocations = filterLocations(mockLocations, filters);
      setLocationData(filteredLocations);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [filters]);

  // Add markers to the map when location data changes
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    locationData.forEach(location => {
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="p-2">
          <h3 class="font-bold">${location.name}</h3>
          <p>Total Scans: ${location.count}</p>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setDOMContent(popupContent);

      // Create and add marker
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = '#3b82f6';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      // Size based on count
      const size = Math.max(20, Math.min(50, 20 + location.count / 10));
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Fit map to markers if there are any
    if (locationData.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      locationData.forEach(location => {
        bounds.extend([location.lng, location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 70, maxZoom: 5 });
    }
  }, [locationData, isLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Locations</CardTitle>
        <CardDescription>
          Geographic distribution of foot scanning activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <div className="h-[400px] w-full relative rounded-md overflow-hidden">
            <div ref={mapContainer} className="absolute inset-0" />
            <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-md shadow-md">
              <div className="flex items-center text-sm">
                <div className="mr-2 text-blue-500">
                  <MapPin size={16} />
                </div>
                <span>
                  {locationData.length} scanning locations
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapSection;
