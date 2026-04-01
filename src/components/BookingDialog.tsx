import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BookingFormData } from '@/hooks/useBookings';
import { Calendar, Clock, MapPin, User, Music, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const bookingSchema = z.object({
  booked_by: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  kirtan_name: z.string().min(2, 'Kirtan name must be at least 2 characters').max(200, 'Kirtan name is too long'),
  kirtan_place: z.string().min(2, 'Place must be at least 2 characters').max(200, 'Place is too long'),
  booking_time: z.string().min(1, 'Please select a time'),
});

type FormData = z.infer<typeof bookingSchema>;

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onSubmit: (data: BookingFormData) => Promise<{ success: boolean; error?: string }>;
}

export function BookingDialog({ open, onOpenChange, selectedDate, onSubmit }: BookingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      booked_by: '',
      kirtan_name: '',
      kirtan_place: '',
      booking_time: '',
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    if (!selectedDate) return;

    setIsSubmitting(true);
    
    const result = await onSubmit({
      booked_by: data.booked_by,
      kirtan_name: data.kirtan_name,
      kirtan_place: data.kirtan_place,
      booking_time: data.booking_time,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: '🎉 Booking Confirmed!',
        description: `Kirtan booked for ${format(selectedDate, 'dd MMMM yyyy')}`,
      });
      reset();
      onOpenChange(false);
    } else {
      toast({
        title: 'Booking Failed',
        description: result.error || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Book Kirtan
          </DialogTitle>
          <DialogDescription>
            Fill in the details to book for{' '}
            <span className="font-semibold text-primary">
              {format(selectedDate, 'dd MMMM yyyy')}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="booked_by" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              Name (Booked By)
            </Label>
            <Input
              id="booked_by"
              placeholder="Enter your name"
              {...register('booked_by')}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
            {errors.booked_by && (
              <p className="text-xs text-destructive">{errors.booked_by.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kirtan_name" className="flex items-center gap-2 text-sm font-medium">
              <Music className="h-4 w-4 text-muted-foreground" />
              Name of Kirtan
            </Label>
            <Input
              id="kirtan_name"
              placeholder="Enter kirtan name"
              {...register('kirtan_name')}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
            {errors.kirtan_name && (
              <p className="text-xs text-destructive">{errors.kirtan_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kirtan_place" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Place of Kirtan
            </Label>
            <Input
              id="kirtan_place"
              placeholder="Enter location"
              {...register('kirtan_place')}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
            {errors.kirtan_place && (
              <p className="text-xs text-destructive">{errors.kirtan_place.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_time" className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              From (Time)
            </Label>
            <Input
              id="booking_time"
              type="time"
              {...register('booking_time')}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
            {errors.booking_time && (
              <p className="text-xs text-destructive">{errors.booking_time.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="saffron"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
