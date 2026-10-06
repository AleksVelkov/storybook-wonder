import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cookie, X, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function CookieConsent() {
  const { language } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookie_consent', JSON.stringify(necessaryOnly));
    setPreferences(necessaryOnly);
    setShowBanner(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {language === 'nl' ? 'We gebruiken cookies 🍪' : 'We use cookies 🍪'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl'
                    ? 'We gebruiken cookies om je ervaring te verbeteren, verkeer te analyseren en gepersonaliseerde content te tonen. Door op "Accepteer alle" te klikken, stem je in met het gebruik van alle cookies.'
                    : 'We use cookies to enhance your experience, analyze traffic, and show personalized content. By clicking "Accept all", you consent to the use of all cookies.'}
                  {' '}
                  <button
                    onClick={() => window.location.href = '/privacy'}
                    className="text-primary hover:underline"
                  >
                    {language === 'nl' ? 'Meer informatie' : 'Learn more'}
                  </button>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                {language === 'nl' ? 'Instellingen' : 'Settings'}
              </Button>
              <Button
                onClick={acceptNecessary}
                variant="outline"
                size="sm"
              >
                {language === 'nl' ? 'Alleen noodzakelijk' : 'Necessary only'}
              </Button>
              <Button
                onClick={acceptAll}
                variant="hero"
                size="sm"
              >
                {language === 'nl' ? 'Accepteer alle' : 'Accept all'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'nl' ? 'Cookie Instellingen' : 'Cookie Settings'}
            </DialogTitle>
            <DialogDescription>
              {language === 'nl'
                ? 'Beheer je cookie voorkeuren. Je kunt je toestemming op elk moment wijzigen.'
                : 'Manage your cookie preferences. You can change your consent at any time.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  {language === 'nl' ? 'Noodzakelijke cookies' : 'Necessary cookies'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl'
                    ? 'Deze cookies zijn essentieel voor de werking van de website en kunnen niet worden uitgeschakeld.'
                    : 'These cookies are essential for the website to function and cannot be disabled.'}
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="w-5 h-5"
                />
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  {language === 'nl' ? 'Functionele cookies' : 'Functional cookies'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl'
                    ? 'Deze cookies zorgen voor verbeterde functionaliteit en personalisatie, zoals taalvoorkeuren en winkelwagen.'
                    : 'These cookies enable enhanced functionality and personalization, such as language preferences and shopping cart.'}
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  {language === 'nl' ? 'Analytische cookies' : 'Analytics cookies'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl'
                    ? 'Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken, zodat we deze kunnen verbeteren.'
                    : 'These cookies help us understand how visitors use our website, allowing us to improve it.'}
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  {language === 'nl' ? 'Marketing cookies' : 'Marketing cookies'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl'
                    ? 'Deze cookies worden gebruikt om advertenties relevanter te maken voor jou en je interesses.'
                    : 'These cookies are used to make advertisements more relevant to you and your interests.'}
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button onClick={acceptNecessary} variant="outline">
              {language === 'nl' ? 'Alleen noodzakelijk' : 'Necessary only'}
            </Button>
            <Button onClick={savePreferences} variant="hero">
              {language === 'nl' ? 'Opslaan' : 'Save preferences'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


