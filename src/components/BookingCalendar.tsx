import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, isBefore, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookings, Booking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { BookingDialog } from '@/components/BookingDialog';
import { BookingDetailsDialog } from '@/components/BookingDetailsDialog';
import { cn } from '@/lib/utils';

export function BookingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { bookings, loading, isDateBooked, getBookingForDate, createBooking, deleteBooking } = useBookings();
  const { user, isWhitelisted } = useAuth();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the starting day offset (0 = Sunday)
  const startOffset = monthStart.getDay();
  const today = startOfToday();

  const handleDateClick = (date: Date) => {
    const booking = getBookingForDate(date);
    
    if (booking) {
      // Show booking details
      setSelectedBooking(booking);
      setShowDetailsDialog(true);
    } else if (user && isWhitelisted && !isBefore(date, today)) {
      // Open booking form for empty dates (only for logged-in whitelisted users)
      setSelectedDate(date);
      setShowBookingDialog(true);
    }
  };

  const getDayClasses = (date: Date) => {
    const isBooked = isDateBooked(date);
    const isPast = isBefore(date, today) && !isToday(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);

    return cn(
      "relative h-12 md:h-16 w-full flex flex-col items-center justify-center rounded-lg transition-all duration-200 text-sm font-medium",
      {
        "text-muted-foreground/40": !isCurrentMonth,
        "text-muted-foreground": isPast && isCurrentMonth,
        "cursor-pointer hover:bg-muted/50": !isBooked && !isPast && isCurrentMonth,
        "bg-primary/10 text-primary border-2 border-primary cursor-pointer hover:bg-primary/20": isBooked && isCurrentMonth,
        "ring-2 ring-accent ring-offset-2": isToday(date),
        "cursor-not-allowed opacity-50": isPast && !isBooked,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="hover:bg-muted"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-xs md:text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12 md:h-16" />
        ))}
        
        {/* Date cells */}
        {days.map((date) => {
          const booking = getBookingForDate(date);
          const isBooked = !!booking;
          
          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={getDayClasses(date)}
            >
              <span className="text-sm md:text-base">{format(date, 'd')}</span>
              {isBooked && isSameMonth(date, currentMonth) && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/10 border-2 border-primary" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-accent ring-offset-1" />
          <span className="text-muted-foreground">Today</span>
        </div>
      </div>

      {/* Upcoming Bookings */}
      {bookings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
            Upcoming Kirtans
          </h3>
          <div className="grid gap-3">
            {bookings
              .filter(b => !isBefore(new Date(b.booking_date), today))
              .slice(0, 5)
              .map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetailsDialog(true);
                  }}
                  className="p-4 rounded-xl gradient-card border border-border/50 shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer decorative-border"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{booking.kirtan_name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {booking.kirtan_place}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1 text-sm">
                      <span className="text-primary font-medium">
                        {format(new Date(booking.booking_date), 'dd MMM yyyy')}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.booking_time}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Booked by: {booking.booked_by}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Booking Dialog */}
      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        selectedDate={selectedDate}
        onSubmit={createBooking}
      />

      {/* Details Dialog */}
      <BookingDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        booking={selectedBooking}
        onDelete={deleteBooking}
      />
    </div>
  );
}
