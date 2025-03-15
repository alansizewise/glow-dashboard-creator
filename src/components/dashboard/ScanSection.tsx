
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

// Mock data for demonstration
const mockScanData = [
  { record_date: '2023-01-05', scan_count: 42, successful_scan_count: 38, geolocation: 'New York, US' },
  { record_date: '2023-01-12', scan_count: 53, successful_scan_count: 45, geolocation: 'Los Angeles, US' },
  { record_date: '2023-01-19', scan_count: 37, successful_scan_count: 32, geolocation: 'Chicago, US' },
  { record_date: '2023-01-26', scan_count: 65, successful_scan_count: 58, geolocation: 'Miami, US' },
  { record_date: '2023-02-02', scan_count: 48, successful_scan_count: 44, geolocation: 'Boston, US' },
  { record_date: '2023-02-09', scan_count: 72, successful_scan_count: 67, geolocation: 'Seattle, US' },
  { record_date: '2023-02-16', scan_count: 59, successful_scan_count: 51, geolocation: 'Denver, US' },
  { record_date: '2023-02-23', scan_count: 63, successful_scan_count: 60, geolocation: 'Austin, US' },
  { record_date: '2023-03-02', scan_count: 51, successful_scan_count: 48, geolocation: 'Philadelphia, US' },
  { record_date: '2023-03-09', scan_count: 68, successful_scan_count: 64, geolocation: 'San Francisco, US' },
  { record_date: '2023-03-16', scan_count: 74, successful_scan_count: 69, geolocation: 'Portland, US' },
  { record_date: '2023-03-23', scan_count: 47, successful_scan_count: 43, geolocation: 'Atlanta, US' },
];

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

const ScanSection = ({ filters }: ScanSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scanData, setScanData] = useState<any[]>([]);
  const isMobile = useIsMobile();

  // Calculate summary stats
  const totalScans = scanData.reduce((sum, item) => sum + item.scan_count, 0);
  const totalSuccessfulScans = scanData.reduce((sum, item) => sum + item.successful_scan_count, 0);
  const successRate = totalScans > 0 ? (totalSuccessfulScans / totalScans * 100).toFixed(1) : '0';

  // Simulate data fetching
  useEffect(() => {
    setIsLoading(true);
    // In a real app, this would be an API call using the filters
    setTimeout(() => {
      setScanData(mockScanData);
      setIsLoading(false);
    }, 1000);
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalScans}</div>
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
              <div className="text-2xl font-bold">{totalSuccessfulScans}</div>
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
              <div className="text-2xl font-bold">{successRate}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Activity Over Time</CardTitle>
          <CardDescription>
            Number of scans and successful scans by date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartContainer
              className="h-[350px]"
              config={{
                total: { label: "Total Scans", color: "#10b981" },
                successful: { label: "Successful Scans", color: "#3b82f6" },
              }}
            >
              <AreaChart
                data={scanData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="record_date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split('-').slice(1).join('/')}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">{data.record_date}</div>
                            <div className="font-medium">{data.geolocation}</div>
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                              <span>Total: {data.scan_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                              <span>Success: {data.successful_scan_count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scan_count"
                  name="total"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="successful_scan_count"
                  name="successful"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSuccess)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scans by Location</CardTitle>
          <CardDescription>
            Distribution of scans across different locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartContainer className="h-[350px]">
              <BarChart 
                data={scanData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="geolocation" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: isMobile ? 8 : 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scan_count" name="Total Scans" fill="#10b981" />
                <Bar dataKey="successful_scan_count" name="Successful Scans" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanSection;
