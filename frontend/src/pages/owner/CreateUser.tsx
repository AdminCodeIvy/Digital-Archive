import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createUser } from '@/services/api';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const createUserSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  middleName: z.string().optional(),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  allowToPublish: z.boolean().default(false),
  createDispute: z.boolean().default(false),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const CreateUser = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      surname: '',
      email: '',
      phoneNumber: '',
      role: '',
      password: '',
      allowToPublish: false,
      createDispute: false,
    },
  });

  // Update permissions based on the selected role
  useEffect(() => {
    if (selectedRole === 'manager') {
      // For manager role, both permissions are true and can't be modified
      form.setValue('allowToPublish', true);
      form.setValue('createDispute', true);
    } else if (selectedRole === 'qa') {
      // For QA role, allowToPublish is true by default but createDispute can be changed
      form.setValue('allowToPublish', true);
    }
  }, [selectedRole, form]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('password', password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numbersOnly = input.replace(/\D/g, '');
    form.setValue('phoneNumber', numbersOnly);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    form.setValue('role', value);
  };

  const onSubmit = async (values: CreateUserFormValues) => {
    setIsSubmitting(true);
    try {
      const fullName = `${values.firstName} ${values.middleName ? values.middleName + ' ' : ''}${values.surname}`;
      const userData = {
        name: fullName,
        email: values.email,
        phone: values.phoneNumber,
        role: values.role,
        password: values.password,
        allow_to_publish: values.allowToPublish,
        create_dispute: values.createDispute,
      };

      const response = await createUser(userData);
      
      if (response.error) {
        toast.error(`Failed to create user: ${response.error}`);
        setIsSubmitting(false);
        return;
      }
      
      toast.success("User created successfully!");
      navigate('/owner/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Determine if checkboxes should be disabled based on role
  const isAllowToPublishDisabled = selectedRole === 'manager' || selectedRole === 'qa';
  const isCreateDisputeDisabled = selectedRole === 'manager';

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create User</h1>
          <p className="text-sm text-muted-foreground">User Management</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Type here"
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Type here"
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Surname</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Type here"
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Type here"
                        type="email"
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Type here"
                        className="mt-1"
                        onChange={handlePhoneInput}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={handleRoleChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger id="role" className="mt-1">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="qa">QA</SelectItem>
                        <SelectItem value="indexer">Indexer</SelectItem>
                        <SelectItem value="scanner">Scanner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6 items-start">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Create Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field}
                          placeholder="Type here"
                          type={showPassword ? "text" : "password"}
                          className="mt-1 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-transparent"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="button" 
                variant="link" 
                className="text-orange-500 mt-8"
                onClick={generatePassword}
              >
                Generate Password
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="allowToPublish"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isAllowToPublishDisabled}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow to Publish</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        User can publish documents to the client
                        {isAllowToPublishDisabled && (
                          <span className="block mt-1 text-orange-500">
                            {selectedRole === 'manager' ? 'Always enabled for Manager role' : 'Always enabled for QA role'}
                          </span>
                        )}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="createDispute"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isCreateDisputeDisabled}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Create Dispute</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        User can create disputes on documents
                        {isCreateDisputeDisabled && (
                          <span className="block mt-1 text-orange-500">
                            Always enabled for Manager role
                          </span>
                        )}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/owner/users')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateUser;
