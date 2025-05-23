
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { X } from 'lucide-react';

interface DocumentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: DocumentFilters) => void;
  initialFilters?: DocumentFilters;
}

export interface DocumentFilters {
  status?: 'all' | 'complete' | 'incomplete' | 'unpublished';
  role?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const DocumentFilterModal = ({ isOpen, onClose, onApplyFilters, initialFilters }: DocumentFilterModalProps) => {
  const [filters, setFilters] = useState<DocumentFilters>(
    initialFilters || {
      status: 'all',
      role: 'all',
      startDate: null,
      endDate: null,
    }
  );

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: DocumentFilters = {
      status: 'all',
      role: 'all',
      startDate: null,
      endDate: null,
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Filter Documents</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value: 'all' | 'complete' | 'incomplete' | 'unpublished') => 
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Added By Role</Label>
            <Select
              value={filters.role || 'all'}
              onValueChange={(value) => setFilters({ ...filters, role: value })}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="scanner">Scanner</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="indexer">Indexer</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker
                date={filters.startDate}
                onSelect={(date) => setFilters({ ...filters, startDate: date })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker
                date={filters.endDate}
                onSelect={(date) => setFilters({ ...filters, endDate: date })}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
