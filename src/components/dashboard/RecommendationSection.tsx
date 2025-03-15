
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { defaultChartConfig } from "@/components/ui/chart-config";

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

// Mock data generator for recommendations
const generateMockData = () => {
  const mockData = [];
  const startDate = new Date(2023, 0, 1);
  const endDate = new Date(2023, 11, 31);
  
  const brands = ['Nike', 'Adidas', 'New Balance', 'Brooks', 'Hoka', 'Altra', 'Asics'];
  const models = ['Runner Pro', 'Walker', 'Trail Blazer', 'Urban Style', 'Comfort Max'];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const recCount = Math.floor(Math.random() * 30) + 5;
    const successRate = Math.random() * 0.2 + 0.8; // 80-100% success rate
    
    for (let i = 0; i < recCount; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      
      mockData.push({
        date: new Date(d),
        recommendationCount: 1,
        successfulRecommendation: Math.random() < successRate ? 1 : 0,
        geolocation: ['London, UK', 'Manchester, UK', 'Birmingham, UK', 'Edinburgh, UK', 'Glasgow, UK'][Math.floor(Math.random() * 5)],
        brand,
        model,
        size: (Math.floor(Math.random() * 15) + 3).toString()
      });
    }
  }
  
  return mockData;
};

const mockRecommendationData = generateMockData();

// Function to filter mock data based on provided filters
const filterMockData = (data: any[], filters: RecommendationSectionProps['filters']) => {
  const startDate = new Date(filters.startDate);
  const endDate = new Date(filters.endDate);
  
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// Aggregation functions
const aggregateByDay = (data: any[]) => {
  const aggregated = data.reduce((acc, item) => {
    const dateStr = format(new Date(item.date), 'yyyy-MM-dd');
    
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: dateStr,
        recommendationCount: 0,
        successfulRecommendationCount: 0,
      };
    }
    
    acc[dateStr].recommendationCount += item.recommendationCount;
    acc[dateStr].successfulRecommendationCount += item.successfulRecommendation;
    
    return acc;
  }, {});
  
  return Object.values(aggregated).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

const aggregateByBrand = (data: any[]) => {
  const aggregated = data.reduce((acc, item) => {
    const { brand } = item;
    
    if (!acc[brand]) {
      acc[brand] = {
        name: brand,
        value: 0,
      };
    }
    
    acc[brand].value += 1;
    
    return acc;
  }, {});
  
  return Object.values(aggregated).sort((a: any, b: any) => b.value - a.value);
};

const aggregateBySize = (data: any[]) => {
  const aggregated = data.reduce((acc, item) => {
    const { size } = item;
    
    if (!acc[size]) {
      acc[size] = {
        size,
        count: 0,
      };
    }
    
    acc[size].count += 1;
    
    return acc;
  }, {});
  
  return Object.values(aggregated).sort((a: any, b: any) => 
    parseFloat(a.size) - parseFloat(b.size)
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#F44336', '#3F51B5'];

const RecommendationSection = ({ filters }: RecommendationSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [brandData, setBrandData] = useState<any[]>([]);
  const [sizeData, setSizeData] = useState<any[]>([]);
  const [totalRecommendations, setTotalRecommendations] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      const filteredData = filterMockData(mockRecommendationData, filters);
      
      const dailyAggregated = aggregateByDay(filteredData);
      const brandAggregated = aggregateByBrand(filteredData);
      const sizeAggregated = aggregateBySize(filteredData);
      
      const total = filteredData.length;
      const successful = filteredData.filter(item => item.successfulRecommendation === 1).length;
      const rate = total > 0 ? (successful / total) * 100 : 0;
      
      setDailyData(dailyAggregated);
      setBrandData(brandAggregated);
      setSizeData(sizeAggregated);
      setTotalRecommendations(total);
      setSuccessRate(rate);
      setIsLoading(false);
    }, 1200);
    
  }, [filters]);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Most Recommended Brand</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{brandData[0]?.name || "N/A"}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {dailyData.length > 0 
                  ? Math.round(totalRecommendations / dailyData.length) 
                  : 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Recommendations</CardTitle>
            <CardDescription>
              Number of recommendations made each day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <ChartContainer className="h-[350px]" config={defaultChartConfig}>
                <LineChart
                  data={dailyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMMM dd, yyyy')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="recommendationCount" 
                    name="Recommendations"
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successfulRecommendationCount" 
                    name="Successful"
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Brand Distribution</CardTitle>
            <CardDescription>
              Breakdown of recommendations by brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <ChartContainer className="h-[350px]" config={defaultChartConfig}>
                <PieChart>
                  <Pie
                    data={brandData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Size Distribution</CardTitle>
          <CardDescription>
            Distribution of recommended sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartContainer className="h-[350px]" config={defaultChartConfig}>
              <BarChart
                data={sizeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="size" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Recommendations" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationSection;
