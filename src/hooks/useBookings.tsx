import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Booking {
  id: string;
  booking_date: string;
  booked_by: string;
  kirtan_name: string;
  kirtan_place: string;
  booking_time: string;
  created_at: string;
  created_by: string | null;
  photo_url: string | null;
}

export interface BookingFormData {
  booked_by: string;
  kirtan_name: string;
  kirtan_place: string;
  booking_date: string;
  booking_time: string;
  photo_url?: string;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    // Set up realtime subscription
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createBooking = async (formData: BookingFormData): Promise<{ success: boolean; error?: string }> => {
    // Check if date is already booked
    const existingBooking = bookings.find(b => b.booking_date === formData.booking_date);
    if (existingBooking) {
      return { success: false, error: 'This date is already booked' };
    }

    const { error } = await supabase
      .from('bookings')
      .insert([{
        booking_date: formData.booking_date,
        booked_by: formData.booked_by,
        kirtan_name: formData.kirtan_name,
        kirtan_place: formData.kirtan_place,
        booking_time: formData.booking_time,
      }]);

    if (error) {
      console.error('Error creating booking:', error);
      if (error.code === '23505') {
        return { success: false, error: 'This date has just been booked by someone else' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const isDateBooked = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.some(b => b.booking_date === dateStr);
  };

  const getBookingForDate = (date: Date): Booking | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.find(b => b.booking_date === dateStr);
  };

  const deleteBooking = async (bookingId: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error('Error deleting booking:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  return {
    bookings,
    loading,
    createBooking,
    deleteBooking,
    isDateBooked,
    getBookingForDate,
    refetch: fetchBookings,
  };
}
