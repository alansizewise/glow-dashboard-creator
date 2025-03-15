
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, FilterIcon } from "lucide-react";

interface FilterProps {
  filters: {
    startDate: string;
    endDate: string;
    tenantId: string;
    countryCode: string;
    minAge: number;
    maxAge: number;
    gender: string;
  };
  onFilterChange: (filters: any) => void;
}

const DashboardFilters = ({ filters, onFilterChange }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setLocalFilters({ ...localFilters, startDate: format(date, 'yyyy-MM-dd') });
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setLocalFilters({ ...localFilters, endDate: format(date, 'yyyy-MM-dd') });
    }
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Date Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.startDate}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          onSelect={handleStartDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.endDate}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          onSelect={handleEndDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant-id">Tenant ID</Label>
                <Select 
                  value={localFilters.tenantId} 
                  onValueChange={(value) => setLocalFilters({...localFilters, tenantId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tenant ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Tenants</SelectItem>
                    <SelectItem value="1">Tenant 1</SelectItem>
                    <SelectItem value="2">Tenant 2</SelectItem>
                    <SelectItem value="3">Tenant 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country-code">Country</Label>
                <Select 
                  value={localFilters.countryCode} 
                  onValueChange={(value) => setLocalFilters({...localFilters, countryCode: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Countries</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Age Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-age">Min Age</Label>
                    <Input 
                      id="min-age" 
                      type="number" 
                      min="0" 
                      max="99" 
                      value={localFilters.minAge} 
                      onChange={(e) => setLocalFilters({...localFilters, minAge: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-age">Max Age</Label>
                    <Input 
                      id="max-age" 
                      type="number" 
                      min="0" 
                      max="99" 
                      value={localFilters.maxAge} 
                      onChange={(e) => setLocalFilters({...localFilters, maxAge: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={localFilters.gender} 
                  onValueChange={(value) => setLocalFilters({...localFilters, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Genders</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleApplyFilters} className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
      <div className="mt-4 text-sm">
        <p className="text-muted-foreground">
          Showing data for {filters.startDate} to {filters.endDate} 
          {filters.tenantId !== 'ALL' ? ` • Tenant: ${filters.tenantId}` : ' • All Tenants'} 
          {filters.countryCode !== 'ALL' ? ` • Country: ${filters.countryCode}` : ' • All Countries'}
        </p>
      </div>
    </div>
  );
};

export default DashboardFilters;
