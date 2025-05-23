
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">User Management</h1>
        <p className="text-muted-foreground">Manage admin users for the digital archive system</p>
      </div>
      
      <Card className="border-dashed border-orange-200">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">User management functionality is currently being developed and will be available soon.</p>
          <Button className="bg-orange-500 hover:bg-orange-600">Learn More</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
