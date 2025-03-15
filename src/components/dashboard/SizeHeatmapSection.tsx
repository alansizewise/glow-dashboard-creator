
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultChartConfig } from "@/components/ui/chart-config";

// Mock data for demonstration
const generateHeatmapData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    const gender = Math.random() > 0.5 ? 'M' : 'F';
    const age = Math.floor(Math.random() * 60) + 10;
    
    // Generate foot measurements based on gender
    let footLength, footWidth;
    
    if (gender === 'M') {
      footLength = (Math.random() * 4) + 24; // 24-28cm
      footWidth = (Math.random() * 1.5) + 9; // 9-10.5cm
    } else {
      footLength = (Math.random() * 3) + 22; // 22-25cm
      footWidth = (Math.random() * 1.5) + 8; // 8-9.5cm
    }
    
    data.push({
      id: i,
      age,
      gender,
      foot_length: parseFloat(footLength.toFixed(1)),
      foot_width: parseFloat(footWidth.toFixed(1)),
      foot_ih: parseFloat((Math.random() * 2 + 5).toFixed(1)),
      foot_heel_ball: parseFloat((Math.random() * 3 + 15).toFixed(1)),
      foot_girth: parseFloat((Math.random() * 5 + 20).toFixed(1)),
      geolocation: ['New York, US', 'Los Angeles, US', 'Chicago, US', 'Miami, US', 'Boston, US'][Math.floor(Math.random() * 5)]
    });
  }
  return data;
};

const mockHeatmapData = generateHeatmapData();

interface SizeHeatmapSectionProps {
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

const SizeHeatmapSection = ({ filters }: SizeHeatmapSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>("length_width");

  // Simulate data fetching
  useEffect(() => {
    setIsLoading(true);
    // In a real app, this would be an API call using the filters
    setTimeout(() => {
      let filteredData = [...mockHeatmapData];
      
      // Apply gender filter
      if (filters.gender !== 'ALL') {
        filteredData = filteredData.filter(item => item.gender === filters.gender);
      }
      
      // Apply age filter
      filteredData = filteredData.filter(
        item => item.age >= filters.minAge && item.age <= filters.maxAge
      );
      
      setHeatmapData(filteredData);
      setIsLoading(false);
    }, 1000);
  }, [filters]);

  // Calculate summary stats
  const maleFeet = heatmapData.filter(item => item.gender === 'M').length;
  const femaleFeet = heatmapData.filter(item => item.gender === 'F').length;
  const averageLength = heatmapData.length > 0 
    ? (heatmapData.reduce((sum, item) => sum + item.foot_length, 0) / heatmapData.length).toFixed(1)
    : '0';
  const averageWidth = heatmapData.length > 0 
    ? (heatmapData.reduce((sum, item) => sum + item.foot_width, 0) / heatmapData.length).toFixed(1)
    : '0';

  // Get the data for the selected measurement
  const getScatterData = () => {
    switch (selectedMeasurement) {
      case 'length_width':
        return heatmapData.map(item => ({ 
          x: item.foot_length, 
          y: item.foot_width,
          z: item.gender,
          age: item.age,
          geolocation: item.geolocation
        }));
      case 'length_ih':
        return heatmapData.map(item => ({ 
          x: item.foot_length, 
          y: item.foot_ih,
          z: item.gender,
          age: item.age,
          geolocation: item.geolocation
        }));
      case 'length_heel_ball':
        return heatmapData.map(item => ({ 
          x: item.foot_length, 
          y: item.foot_heel_ball,
          z: item.gender,
          age: item.age,
          geolocation: item.geolocation
        }));
      case 'length_girth':
        return heatmapData.map(item => ({ 
          x: item.foot_length, 
          y: item.foot_girth,
          z: item.gender,
          age: item.age,
          geolocation: item.geolocation
        }));
      default:
        return [];
    }
  };

  const getAxisLabels = () => {
    switch (selectedMeasurement) {
      case 'length_width':
        return { xLabel: 'Foot Length (cm)', yLabel: 'Foot Width (cm)' };
      case 'length_ih':
        return { xLabel: 'Foot Length (cm)', yLabel: 'Instep Height (cm)' };
      case 'length_heel_ball':
        return { xLabel: 'Foot Length (cm)', yLabel: 'Heel-Ball Length (cm)' };
      case 'length_girth':
        return { xLabel: 'Foot Length (cm)', yLabel: 'Foot Girth (cm)' };
      default:
        return { xLabel: '', yLabel: '' };
    }
  };

  const { xLabel, yLabel } = getAxisLabels();
  const scatterData = getScatterData();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{heatmapData.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male Feet</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{maleFeet}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Female Feet</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{femaleFeet}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Length / Width</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{averageLength}cm / {averageWidth}cm</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foot Size Heatmap</CardTitle>
          <CardDescription>
            Distribution of foot measurements across the population
          </CardDescription>
          <Tabs 
            value={selectedMeasurement} 
            onValueChange={setSelectedMeasurement}
            className="mt-4"
          >
            <TabsList>
              <TabsTrigger value="length_width">Length vs Width</TabsTrigger>
              <TabsTrigger value="length_ih">Length vs Instep Height</TabsTrigger>
              <TabsTrigger value="length_heel_ball">Length vs Heel-Ball</TabsTrigger>
              <TabsTrigger value="length_girth">Length vs Girth</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[450px] w-full" />
          ) : (
            <ChartContainer className="h-[450px]" config={defaultChartConfig}>
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name={xLabel} unit="cm" />
                <YAxis type="number" dataKey="y" name={yLabel} unit="cm" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-1">
                            <div className="font-medium">
                              {data.z === 'M' ? 'Male' : 'Female'}, {data.age} years
                            </div>
                            <div>Location: {data.geolocation}</div>
                            <Separator />
                            <div>
                              {xLabel}: {data.x.toFixed(1)}cm
                            </div>
                            <div>
                              {yLabel}: {data.y.toFixed(1)}cm
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Male" data={scatterData.filter(d => d.z === 'M')} fill="#3b82f6" />
                <Scatter name="Female" data={scatterData.filter(d => d.z === 'F')} fill="#ec4899" />
              </ScatterChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>
              Distribution of foot measurements by age
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer className="h-[300px]" config={defaultChartConfig}>
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid />
                  <XAxis type="number" dataKey="age" name="Age" unit=" years" />
                  <YAxis type="number" dataKey="x" name="Foot Length" unit="cm" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-1">
                              <div className="font-medium">
                                {data.z === 'M' ? 'Male' : 'Female'}, {data.age} years
                              </div>
                              <div>Length: {data.x.toFixed(1)}cm</div>
                              <div>Width: {data.y.toFixed(1)}cm</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    name="Male" 
                    data={heatmapData
                      .filter(d => d.gender === 'M')
                      .map(d => ({ 
                        age: d.age, 
                        x: d.foot_length,
                        y: d.foot_width,
                        z: d.gender
                      }))} 
                    fill="#3b82f6" 
                  />
                  <Scatter 
                    name="Female" 
                    data={heatmapData
                      .filter(d => d.gender === 'F')
                      .map(d => ({ 
                        age: d.age, 
                        x: d.foot_length,
                        y: d.foot_width,
                        z: d.gender
                      }))} 
                    fill="#ec4899" 
                  />
                </ScatterChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Location</CardTitle>
            <CardDescription>
              Distribution of foot measurements by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="space-y-4">
                {Array.from(new Set(heatmapData.map(d => d.geolocation))).map(location => {
                  const locationData = heatmapData.filter(d => d.geolocation === location);
                  const avgLength = (locationData.reduce((sum, d) => sum + d.foot_length, 0) / locationData.length).toFixed(1);
                  const avgWidth = (locationData.reduce((sum, d) => sum + d.foot_width, 0) / locationData.length).toFixed(1);
                  
                  return (
                    <div key={location as string} className="flex items-center justify-between">
                      <div className="font-medium">{location as string}</div>
                      <div className="flex gap-4">
                        <div className="text-sm">
                          Count: <span className="font-medium">{locationData.length}</span>
                        </div>
                        <div className="text-sm">
                          Avg Length: <span className="font-medium">{avgLength}cm</span>
                        </div>
                        <div className="text-sm">
                          Avg Width: <span className="font-medium">{avgWidth}cm</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SizeHeatmapSection;
