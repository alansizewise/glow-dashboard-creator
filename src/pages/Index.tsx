
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import ScanSection from "@/components/dashboard/ScanSection";
import RecommendationSection from "@/components/dashboard/RecommendationSection";
import SizeHeatmapSection from "@/components/dashboard/SizeHeatmapSection";
import MapSection from "@/components/dashboard/MapSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [filters, setFilters] = useState({
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    tenantId: "ALL",
    countryCode: "ALL",
    minAge: 0,
    maxAge: 99,
    gender: "ALL",
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Foot Scanning Analytics Dashboard</h1>
        
        <DashboardFilters filters={filters} onFilterChange={handleFilterChange} />
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="scans" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="scans">Scans</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="heatmap">Size Heatmap</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scans">
            <ScanSection filters={filters} />
          </TabsContent>
          
          <TabsContent value="recommendations">
            <RecommendationSection filters={filters} />
          </TabsContent>
          
          <TabsContent value="heatmap">
            <SizeHeatmapSection filters={filters} />
          </TabsContent>
          
          <TabsContent value="map">
            <MapSection filters={filters} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
