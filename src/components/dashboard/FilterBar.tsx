import { Calendar, Filter, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FilterOption } from '@/types/common';

export interface DateRangeFilter {
  dateRange: '7days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | '30days' | '90days' | '1year' | 'ytd';
  category: 'all' | 'revenue' | 'customers' | 'products';
}

interface FilterBarProps {
  onFilterChange: (filters: DateRangeFilter) => void;
  currentFilters: DateRangeFilter;
}

const FilterBar = ({ onFilterChange, currentFilters }: FilterBarProps) => {
  return (
    <Card className="p-4 mb-6 bg-gradient-card">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={currentFilters.dateRange}
            onValueChange={(value) => onFilterChange({ ...currentFilters, dateRange: value as DateRangeFilter['dateRange'] })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={currentFilters.category}
            onValueChange={(value) => onFilterChange({ ...currentFilters, category: value as DateRangeFilter['category'] })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="products">Products</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FilterBar;