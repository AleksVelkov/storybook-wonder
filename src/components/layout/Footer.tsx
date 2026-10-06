import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Instagram } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export function Footer() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: language === 'nl' ? 'Email vereist' : 'Email required',
        description: language === 'nl' ? 'Voer een geldig e-mailadres in' : 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: language === 'nl' ? 'Gelukt!' : 'Success!',
          description: language === 'nl' 
            ? 'Je bent ingeschreven voor onze nieuwsbrief' 
            : 'You have been subscribed to our newsletter',
        });
        setEmail('');
      } else {
        toast({
          title: language === 'nl' ? 'Fout' : 'Error',
          description: data.error || (language === 'nl' ? 'Er is iets misgegaan' : 'Something went wrong'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: language === 'nl' ? 'Verbindingsfout' : 'Connection Error',
        description: language === 'nl' 
          ? 'Kan geen verbinding maken met de server' 
          : 'Unable to connect to server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.PNG" 
                alt="Sterren Verhalen" 
                className="h-[84px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-2xl font-bold">Sterren Verhalen</span>
            </Link>
            <p className="text-background/70">{t('footer.tagline')}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{language === 'nl' ? 'Klantenservice' : 'Customer Service'}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/help" className="text-background/70 hover:text-background transition-colors text-sm">
                {language === 'nl' ? 'Help & FAQ' : 'Help & FAQ'}
              </Link>
              <Link to="/shipping-returns" className="text-background/70 hover:text-background transition-colors text-sm">
                {language === 'nl' ? 'Verzending & Retourneren' : 'Shipping & Returns'}
              </Link>
              <Link to="/contact" className="text-background/70 hover:text-background transition-colors text-sm">
                {language === 'nl' ? 'Contact' : 'Contact'}
              </Link>
              <Link to="/about" className="text-background/70 hover:text-background transition-colors text-sm">
                {language === 'nl' ? 'Over Ons' : 'About Us'}
              </Link>
              <Link to="/profile" className="text-background/70 hover:text-background transition-colors text-sm">
                {language === 'nl' ? 'Mijn Account' : 'My Account'}
              </Link>
            </nav>
          </div>

          {/* Legal & Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.contact')}</h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:info@sterrenverhalen.nl" className="flex items-center gap-2 text-background/70 hover:text-background transition-colors">
                <Mail className="w-4 h-4" />
                info@sterrenverhalen.nl
              </a>
              <div className="flex items-center gap-2 text-background/70">
                <MapPin className="w-4 h-4" />
                Weesp, The Netherlands
              </div>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/terms" className="text-background/70 hover:text-background transition-colors text-sm">
                {language === 'nl' ? 'Algemene Voorwaarden' : 'Terms and Conditions'}
              </Link>
              <Link to="/privacy" className="text-background/70 hover:text-background transition-colors text-sm">
                {language === 'nl' ? 'Privacybeleid' : 'Privacy Policy'}
              </Link>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-background transition-colors text-sm">
                {language === 'nl' ? 'Sitemap' : 'Sitemap'}
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.newsletter')}</h4>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletter.placeholder')}
                className="w-full px-4 py-2 rounded-full bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:outline-none focus:border-primary"
                disabled={loading}
              />
              <Button 
                type="submit" 
                variant="accent" 
                size="sm" 
                className="rounded-full w-full"
                disabled={loading}
              >
                {loading ? (language === 'nl' ? 'Bezig...' : 'Loading...') : t('footer.newsletter.button')}
              </Button>
            </form>
            <div className="p-3 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-background/20">
              <p className="text-sm text-background/90 leading-relaxed">
                ✨ {language === 'nl' 
                  ? 'Ontvang een coupon voor 10% korting op je volgende bestelling bij inschrijving!' 
                  : 'Receive a coupon for 10% off your next order when you subscribe!'}
              </p>
            </div>

            {/* Payment Methods & Social Media */}
            <div className="space-y-4 pt-4 border-t border-background/20">
              <div>
                <h5 className="text-sm font-semibold mb-3">{language === 'nl' ? 'Betaalmethoden' : 'Payment Methods'}</h5>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white rounded px-3 py-2 flex items-center justify-center h-10" title="iDEAL">
                    <img src="/ideal.svg" alt="iDEAL" className="h-6 object-contain" />
                  </div>
                  <div className="bg-white rounded px-3 py-2 flex items-center justify-center h-10" title="Visa">
                    <img src="/visa.svg" alt="Visa" className="h-6 object-contain" />
                  </div>
                  <div className="bg-white rounded px-3 py-2 flex items-center justify-center h-10" title="Mastercard">
                    <img src="/mastercard.svg" alt="Mastercard" className="h-6 object-contain" />
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold mb-3">{language === 'nl' ? 'Volg ons' : 'Follow us'}</h5>
                <div className="flex gap-3">
                  <a 
                    href="https://www.instagram.com/sterrenverhalen.nl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://www.facebook.com/sterrenverhalen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/20 text-center text-background/60">
          <p>© {new Date().getFullYear()} Sterren Verhalen. {t('footer.rights')}.</p>
          <p className="text-xs mt-2">
            Weesp, Nederland • KVK: [NUMMER] • BTW: NL[NUMMER]
          </p>
        </div>
      </div>
    </footer>
  );
}
