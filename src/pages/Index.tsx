import { Header } from '@/components/Header';
import { BookingCalendar } from '@/components/BookingCalendar';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const { user, isWhitelisted, loading } = useAuth();

  return (
    <>
      <Helmet>
        <title>SHREE SHYAM SEWAK KALYAN SANGH - Kirtan Booking Calendar</title>
        <meta name="description" content="Book and view upcoming Kirtan events at SHREE SHYAM SEWAK KALYAN SANGH. Community calendar for spiritual gatherings." />
      </Helmet>

      <div className="min-h-screen gradient-hero">
        <Header />

        <main className="container px-4 md:px-8 py-8 md:py-12">
          {/* Hero Section */}
          <section className="text-center mb-10 md:mb-14 animate-slide-up">
            <div className="inline-block mb-4">
              <div className="h-1 w-24 mx-auto gradient-primary rounded-full" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
              SHREE SHYAM SEWAK
              <br />
              <span className="text-gradient">KALYAN SANGH</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              KIRTAN BOOKING CALANDER
            </p>
            <div className="h-1 w-24 mx-auto gradient-primary rounded-full mt-4" />
          </section>

          {/* Status Banner */}
          {user && isWhitelisted && (
            <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center animate-fade-in">
              <p className="text-sm text-primary font-medium">
                ✨ You are logged in. Click on any available date to book a Kirtan.
              </p>
            </div>
          )}

          {!user && (
            <div className="mb-6 p-3 rounded-lg bg-muted border border-border text-center animate-fade-in">
              <p className="text-sm text-muted-foreground">
                📅 Viewing calendar in read-only mode. Admin login required for booking.
              </p>
            </div>
          )}

          {/* Calendar Section */}
          <section className="bg-card rounded-2xl shadow-soft border border-border/50 p-4 md:p-8 animate-fade-in decorative-border">
            <BookingCalendar />
          </section>

          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-muted-foreground">
            <p> SHREE SHYAM SEWAK KALYAN SANGH</p>
            <p className="mt-1">जय श्री श्याम 🙏</p>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Index;
