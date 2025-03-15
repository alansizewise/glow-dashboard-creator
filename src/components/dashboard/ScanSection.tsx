
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { defaultChartConfig } from "@/components/ui/chart-config";

interface ScanSectionProps {
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

// Mock data generator
const generateMockData = () => {
  const mockData = [];
  const startDate = new Date(2023, 0, 1);
  const endDate = new Date(2023, 11, 31);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const scanCount = Math.floor(Math.random() * 40) + 10;
    const successRate = Math.random() * 0.3 + 0.7; // 70-100% success rate
    
    mockData.push({
      date: new Date(d),
      scanCount,
      successfulScanCount: Math.floor(scanCount * successRate),
      geolocation: ['London, UK', 'Manchester, UK', 'Birmingham, UK', 'Edinburgh, UK', 'Glasgow, UK'][Math.floor(Math.random() * 5)]
    });
  }
  
  return mockData;
};

const mockScanData = generateMockData();

// Function to filter mock data based on provided filters
const filterMockData = (data: any[], filters: ScanSectionProps['filters']) => {
  const startDate = new Date(filters.startDate);
  const endDate = new Date(filters.endDate);
  
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// Function to aggregate data by day
const aggregateDataByDay = (data: any[]) => {
  const aggregated = data.reduce((acc, item) => {
    const dateStr = format(new Date(item.date), 'yyyy-MM-dd');
    
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: dateStr,
        scanCount: 0,
        successfulScanCount: 0,
      };
    }
    
    acc[dateStr].scanCount += item.scanCount;
    acc[dateStr].successfulScanCount += item.successfulScanCount;
    
    return acc;
  }, {});
  
  return Object.values(aggregated).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Function to aggregate data by week
const aggregateDataByWeek = (data: any[]) => {
  const aggregated = data.reduce((acc, item) => {
    const date = new Date(item.date);
    const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(date), 'yyyy-MM-dd');
    const weekKey = `${weekStart} to ${weekEnd}`;
    
    if (!acc[weekKey]) {
      acc[weekKey] = {
        dateRange: weekKey,
        scanCount: 0,
        successfulScanCount: 0,
      };
    }
    
    acc[weekKey].scanCount += item.scanCount;
    acc[weekKey].successfulScanCount += item.successfulScanCount;
    
    return acc;
  }, {});
  
  return Object.values(aggregated);
};

// Function to calculate top locations
const calculateTopLocations = (data: any[]) => {
  const locationMap = data.reduce((acc, item) => {
    const location = item.geolocation;
    
    if (!acc[location]) {
      acc[location] = {
        location,
        scanCount: 0,
        successfulScanCount: 0,
      };
    }
    
    acc[location].scanCount += item.scanCount;
    acc[location].successfulScanCount += item.successfulScanCount;
    
    return acc;
  }, {});
  
  return Object.values(locationMap)
    .sort((a: any, b: any) => b.scanCount - a.scanCount)
    .slice(0, 5);
};

const ScanSection = ({ filters }: ScanSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [topLocations, setTopLocations] = useState<any[]>([]);
  const [successRate, setSuccessRate] = useState<number>(0);
  const [aggregation, setAggregation] = useState<'daily' | 'weekly'>('daily');
  
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      const filteredData = filterMockData(mockScanData, filters);
      const aggregatedDaily = aggregateDataByDay(filteredData);
      const aggregatedWeekly = aggregateDataByWeek(filteredData);
      const locations = calculateTopLocations(filteredData);
      
      const totalScans = filteredData.reduce((sum, item) => sum + item.scanCount, 0);
      const successfulScans = filteredData.reduce((sum, item) => sum + item.successfulScanCount, 0);
      const rate = totalScans > 0 ? (successfulScans / totalScans) * 100 : 0;
      
      setDailyData(aggregatedDaily);
      setWeeklyData(aggregatedWeekly);
      setTopLocations(locations);
      setSuccessRate(rate);
      setIsLoading(false);
    }, 1000);
    
  }, [filters]);
  
  const currentData = aggregation === 'daily' ? dailyData : weeklyData;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {currentData.reduce((sum: number, item: any) => sum + item.scanCount, 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {currentData.reduce((sum: number, item: any) => sum + item.successfulScanCount, 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scanning Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{topLocations.length}</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Scan Activity</CardTitle>
          <CardDescription>
            Overview of scanning activity over time
          </CardDescription>
          <Tabs 
            value={aggregation} 
            onValueChange={(value) => setAggregation(value as 'daily' | 'weekly')}
            className="mt-4"
          >
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartContainer className="h-[350px]" config={defaultChartConfig}>
              <LineChart
                data={currentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={aggregation === 'daily' ? "date" : "dateRange"} 
                  tickFormatter={(value) => {
                    if (aggregation === 'daily') {
                      return format(new Date(value), 'MMM dd');
                    }
                    return value.split(' to ')[0];
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    if (aggregation === 'daily') {
                      return format(new Date(value), 'MMMM dd, yyyy');
                    }
                    return value;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="scanCount" 
                  name="Total Scans"
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="successfulScanCount" 
                  name="Successful Scans"
                  stroke="#10b981" 
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Scanning Locations</CardTitle>
          <CardDescription>
            Locations with the highest scan volumes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartContainer className="h-[350px]" config={defaultChartConfig}>
              <BarChart
                data={topLocations}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="location" 
                  type="category" 
                  width={120}
                />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="scanCount" 
                  name="Total Scans" 
                  fill="#3b82f6" 
                />
                <Bar 
                  dataKey="successfulScanCount" 
                  name="Successful Scans" 
                  fill="#10b981" 
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanSection;
