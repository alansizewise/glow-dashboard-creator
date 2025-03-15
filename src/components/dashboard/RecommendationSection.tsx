
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

// Mock data for demonstration
const mockRecommendationData = [
  { record_date: '2023-01-05', recommendation_count: 36, successful_recommendation_count: 32, geolocation: 'New York, US' },
  { record_date: '2023-01-12', recommendation_count: 47, successful_recommendation_count: 42, geolocation: 'Los Angeles, US' },
  { record_date: '2023-01-19', recommendation_count: 31, successful_recommendation_count: 28, geolocation: 'Chicago, US' },
  { record_date: '2023-01-26', recommendation_count: 59, successful_recommendation_count: 51, geolocation: 'Miami, US' },
  { record_date: '2023-02-02', recommendation_count: 43, successful_recommendation_count: 40, geolocation: 'Boston, US' },
  { record_date: '2023-02-09', recommendation_count: 65, successful_recommendation_count: 61, geolocation: 'Seattle, US' },
  { record_date: '2023-02-16', recommendation_count: 52, successful_recommendation_count: 46, geolocation: 'Denver, US' },
  { record_date: '2023-02-23', recommendation_count: 58, successful_recommendation_count: 55, geolocation: 'Austin, US' },
  { record_date: '2023-03-02', recommendation_count: 46, successful_recommendation_count: 44, geolocation: 'Philadelphia, US' },
  { record_date: '2023-03-09', recommendation_count: 62, successful_recommendation_count: 59, geolocation: 'San Francisco, US' },
  { record_date: '2023-03-16', recommendation_count: 67, successful_recommendation_count: 64, geolocation: 'Portland, US' },
  { record_date: '2023-03-23', recommendation_count: 42, successful_recommendation_count: 39, geolocation: 'Atlanta, US' },
];

interface RecommendationSectionProps {
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

const RecommendationSection = ({ filters }: RecommendationSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationData, setRecommendationData] = useState<any[]>([]);
  const isMobile = useIsMobile();

  // Calculate summary stats
  const totalRecommendations = recommendationData.reduce((sum, item) => sum + item.recommendation_count, 0);
  const totalSuccessfulRecommendations = recommendationData.reduce((sum, item) => sum + item.successful_recommendation_count, 0);
  const successRate = totalRecommendations > 0 ? (totalSuccessfulRecommendations / totalRecommendations * 100).toFixed(1) : '0';

  // Simulate data fetching
  useEffect(() => {
    setIsLoading(true);
    // In a real app, this would be an API call using the filters
    setTimeout(() => {
      setRecommendationData(mockRecommendationData);
      setIsLoading(false);
    }, 1000);
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalRecommendations}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalSuccessfulRecommendations}</div>
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
          <CardTitle>Recommendation Activity Over Time</CardTitle>
          <CardDescription>
            Number of recommendations and successful recommendations by date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartContainer
              className="h-[350px]"
              config={{
                total: { label: "Total Recommendations", color: "#f59e0b" },
                successful: { label: "Successful Recommendations", color: "#8b5cf6" },
              }}
            >
              <AreaChart
                data={recommendationData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotalRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSuccessRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                              <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                              <span>Total: {data.recommendation_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
                              <span>Success: {data.successful_recommendation_count}</span>
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
                  dataKey="recommendation_count"
                  name="total"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorTotalRec)"
                />
                <Area
                  type="monotone"
                  dataKey="successful_recommendation_count"
                  name="successful"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorSuccessRec)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations by Location</CardTitle>
          <CardDescription>
            Distribution of recommendations across different locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartContainer className="h-[350px]">
              <BarChart 
                data={recommendationData} 
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
                <Bar dataKey="recommendation_count" name="Total Recommendations" fill="#f59e0b" />
                <Bar dataKey="successful_recommendation_count" name="Successful Recommendations" fill="#8b5cf6" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationSection;
