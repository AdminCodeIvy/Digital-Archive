
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Mock permission types for the role configuration
const permissionGroups = [
  {
    title: 'User Management',
    allPermissions: false,
    permissions: [
      { id: 'user', name: 'User', actions: ['Add', 'View', 'Edit', 'Delete'] },
      { id: 'roles', name: 'Roles', actions: ['Add', 'View', 'Edit', 'Delete'] },
      { id: 'profile', name: 'Profile Photo', actions: ['Add', 'View', 'Edit', 'Delete'] },
      { id: 'password', name: 'Password', actions: ['Add', 'View', 'Edit', 'Delete'] },
      { id: 'permission', name: 'Permission', actions: ['Add', 'View', 'Edit', 'Delete'] },
    ]
  },
  {
    title: 'Document Management',
    allPermissions: false,
    permissions: [
      { id: 'document', name: 'Document', actions: ['Add', 'View', 'Edit', 'Delete'] },
      { id: 'fields', name: 'Document Fields', actions: ['Add', 'View', 'Edit', 'Delete'] },
      { id: 'tag', name: 'Document Tag', actions: ['Add', 'View', 'Edit', 'Delete'] },
      { id: 'download', name: 'Document Download', actions: ['Add', 'View', 'Edit', 'Delete'] },
      { id: 'share', name: 'Document Share', isYesNo: true },
      { id: 'search', name: 'Document Search', isYesNo: true },
    ]
  },
  {
    title: 'Other Permissions',
    allPermissions: false,
    permissions: [
      { id: 'logs', name: 'View Activity Logs', isCheckbox: true },
      { id: 'registration', name: 'User registration', isCheckbox: true },
      { id: 'download', name: 'Report download', isCheckbox: true },
      { id: 'report', name: 'Generate report', isCheckbox: true },
    ]
  }
];

const CreateEditRole = () => {
  const navigate = useNavigate();
  const [roleTitle, setRoleTitle] = useState('');
  const [permissions, setPermissions] = useState(permissionGroups);
  
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

  const toggleAllPermissions = (groupIndex: number) => {
    const newPermissions = [...permissions];
    const currentValue = !newPermissions[groupIndex].allPermissions;
    newPermissions[groupIndex].allPermissions = currentValue;
    setPermissions(newPermissions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    toast.success("Role created successfully!");
    navigate('/owner/users/roles');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigate('/owner/users/roles')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Create/Edit Role</h1>
          </div>
          <p className="text-sm text-muted-foreground">User Management</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Input 
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Role Title Here"
            className="text-lg"
          />
        </div>

        {permissions.map((group, groupIndex) => (
          <Card key={groupIndex} className="mb-6 overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id={`all-${groupIndex}`} 
                  checked={group.allPermissions}
                  onCheckedChange={() => toggleAllPermissions(groupIndex)}
                />
                <Label htmlFor={`all-${groupIndex}`} className="font-medium">
                  {group.title}
                </Label>
              </div>
            </div>
            <div className="divide-y">
              {group.permissions.map((perm, permIndex) => (
                <div key={permIndex} className="p-4">
                  {perm.isCheckbox ? (
                    <div className="flex items-center gap-2">
                      <Checkbox id={`${group.title}-${perm.id}`} />
                      <Label htmlFor={`${group.title}-${perm.id}`}>{perm.name}</Label>
                    </div>
                  ) : perm.isYesNo ? (
                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-6">{perm.name}</div>
                      <div className="col-span-6">
                        <Checkbox id={`${group.title}-${perm.id}-yes`} />
                        <Label htmlFor={`${group.title}-${perm.id}-yes`} className="ml-2">Yes</Label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-6">{perm.name}</div>
                      {perm.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="col-span-1.5 flex items-center gap-2">
                          <Checkbox id={`${group.title}-${perm.id}-${action}`} />
                          <Label htmlFor={`${group.title}-${perm.id}-${action}`} className="text-xs">
                            {action}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/owner/users/roles')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditRole;
