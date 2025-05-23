
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfile, updateUserProfile } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import axios from 'axios';

const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const userRole = user?.role?.toLowerCase() || '';
  
  // Get current date and time for display
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  
  // Fetch user profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });
  
  const profile = profileData?.data?.profile || {};
  const role = profileData?.data?.role || user?.role || '';
  
  // Create initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  // Handle file upload to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // Use your Cloudinary upload preset
      
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/djunaxxv0/image/upload',
        formData
      );
      
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      toast.error('Failed to upload image');
      throw error;
    }
  };
  
  // Mutation for updating profile picture
  const updateProfilePictureMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile picture updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update profile picture: ${error.message || 'Unknown error'}`);
    }
  });
  
  // Handle file selection and upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      toast.info('Uploading image...');
      const imageUrl = await uploadToCloudinary(file);
      
      updateProfilePictureMutation.mutate({
        profile_picture: imageUrl
      });
    } catch (error) {
      console.error('Error in file upload process:', error);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{profile.name || 'Name Here'}</h1>
          <p className="text-sm text-muted-foreground">Profile</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div className="w-full aspect-square bg-green-50 flex items-center justify-center overflow-hidden">
                  {profile.profile_picture ? (
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage 
                        src={profile.profile_picture} 
                        alt={profile.name || "User"} 
                        className="object-cover w-full h-full"
                      />
                      <AvatarFallback className="w-full h-full text-6xl">
                        {getInitials(profile.name || '')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <Avatar className="w-32 h-32">
                        <AvatarFallback className="text-4xl">
                          {getInitials(profile.name || '')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleUploadClick}
                  variant="outline" 
                  className="absolute bottom-4 right-4 bg-orange-500 text-white hover:bg-orange-600"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Photo
                </Button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Profile</h2>
                <Button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                  <p className="font-medium">{role}</p>
                </div>
                
                {role !== 'Client' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Documents Reviewed</h3>
                    <p className="font-medium">{profile.documents_reviewed || 0}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p className="font-medium">{profile.email || 'email@email.com'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                  <p className="font-medium">{profile.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Password</h3>
                  <p className="font-medium">••••••••</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {isEditModalOpen && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
