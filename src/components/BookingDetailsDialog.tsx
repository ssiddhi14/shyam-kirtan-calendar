import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Booking } from '@/hooks/useBookings';
import { Calendar, Clock, MapPin, User, Music } from 'lucide-react';

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function BookingDetailsDialog({ open, onOpenChange, booking }: BookingDetailsDialogProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Kirtan Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h3 className="font-serif font-bold text-lg text-foreground">
              {booking.kirtan_name}
            </h3>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">
                  {format(new Date(booking.booking_date), 'EEEE, dd MMMM yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium text-foreground">{booking.booking_time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{booking.kirtan_place}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Booked By</p>
                <p className="font-medium text-foreground">{booking.booked_by}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Booked on {format(new Date(booking.created_at), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
