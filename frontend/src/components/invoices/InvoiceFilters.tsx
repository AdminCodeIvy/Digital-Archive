
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type InvoicePeriod = 'all' | 'current_month' | 'last_month';
export type InvoiceStatus = 'all' | 'paid' | 'unpaid';
export type InvoiceType = 'all' | 'custom' | 'monthly';

interface InvoiceFiltersProps {
  period: InvoicePeriod;
  status: InvoiceStatus;
  type: InvoiceType;
  onPeriodChange: (period: InvoicePeriod) => void;
  onStatusChange: (status: InvoiceStatus) => void;
  onTypeChange: (type: InvoiceType) => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  period,
  status,
  type,
  onPeriodChange,
  onStatusChange,
  onTypeChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Period Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-gray-300">
            Period: {period === 'all' 
              ? 'All Time' 
              : period === 'current_month' 
                ? 'Current Month' 
                : 'Last Month'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white">
          <DropdownMenuLabel>Select Period</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => onPeriodChange('all')} 
              className="flex justify-between"
            >
              All Time
              {period === 'all' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPeriodChange('current_month')}
              className="flex justify-between"
            >
              Current Month
              {period === 'current_month' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPeriodChange('last_month')}
              className="flex justify-between"
            >
              Last Month
              {period === 'last_month' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-gray-300">
            Status: {status === 'all' 
              ? 'All' 
              : status === 'paid' 
                ? 'Paid' 
                : 'Unpaid'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white">
          <DropdownMenuLabel>Select Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => onStatusChange('all')}
              className="flex justify-between"
            >
              All
              {status === 'all' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onStatusChange('paid')}
              className="flex justify-between"
            >
              Paid
              {status === 'paid' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onStatusChange('unpaid')}
              className="flex justify-between"
            >
              Unpaid
              {status === 'unpaid' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-gray-300">
            Type: {type === 'all' 
              ? 'All' 
              : type === 'custom' 
                ? 'Custom' 
                : 'Monthly'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white">
          <DropdownMenuLabel>Select Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => onTypeChange('all')}
              className="flex justify-between"
            >
              All
              {type === 'all' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onTypeChange('custom')}
              className="flex justify-between"
            >
              Custom Invoice
              {type === 'custom' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onTypeChange('monthly')}
              className="flex justify-between"
            >
              Monthly Invoice
              {type === 'monthly' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Clear Filters Button - Only show if any filter is active */}
      {(period !== 'all' || status !== 'all' || type !== 'all') && (
        <Button 
          variant="ghost" 
          onClick={() => {
            onPeriodChange('all');
            onStatusChange('all');
            onTypeChange('all');
          }}
          className="border border-gray-300 flex items-center"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default InvoiceFilters;
