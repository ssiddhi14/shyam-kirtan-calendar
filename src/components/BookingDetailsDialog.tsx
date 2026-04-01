import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Booking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, MapPin, User, Music, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onDelete?: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
}

export function BookingDetailsDialog({ open, onOpenChange, booking, onDelete }: BookingDetailsDialogProps) {
  const { user, isWhitelisted } = useAuth();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!booking) return null;

  // Any whitelisted user can delete any booking
  const canDelete = user && isWhitelisted;

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    const result = await onDelete(booking.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: 'Booking Deleted',
        description: 'The booking has been successfully removed.',
      });
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete booking',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              Kirtan Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {booking.photo_url && (
              <div className="w-full rounded-xl overflow-hidden border border-border">
                <img src={booking.photo_url} alt={booking.kirtan_name} className="w-full h-48 object-cover" />
              </div>
            )}
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
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.kirtan_place)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {booking.kirtan_place}
                  </a>
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

            {canDelete && (
              <div className="pt-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Booking
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking for "{booking.kirtan_name}" on {format(new Date(booking.booking_date), 'dd MMMM yyyy')}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
