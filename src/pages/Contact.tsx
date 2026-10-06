import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const Contact = () => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          language: language,
        }),
      });

      if (response.ok) {
        toast.success(
          language === 'nl' 
            ? 'Bericht succesvol verzonden! We nemen zo snel mogelijk contact met je op.' 
            : 'Message sent successfully! We will get back to you as soon as possible.'
        );
        setFormData({ name: '', email: '', message: '' });
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || 
          (language === 'nl' ? 'Er is iets misgegaan. Probeer het later opnieuw.' : 'Something went wrong. Please try again later.')
        );
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(
        language === 'nl' 
          ? 'Kan geen verbinding maken met de server. Probeer het later opnieuw.' 
          : 'Unable to connect to server. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{language === 'nl' ? 'Contact - Sterren Verhalen' : 'Contact - Sterren Verhalen'}</title>
        <meta 
          name="description" 
          content={language === 'nl' 
            ? 'Neem contact met ons op. We horen graag van je!' 
            : 'Get in touch with us. We\'d love to hear from you!'
          } 
        />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t('contact.title')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('contact.subtitle')}
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="magical-card">
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    {language === 'nl' ? 'Hoe kunnen we helpen?' : 'How can we help?'}
                  </h2>
                  <div className="space-y-4">
                    <a 
                      href="mailto:info@sterrenverhalen.nl"
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">info@sterrenverhalen.nl</div>
                      </div>
                    </a>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{language === 'nl' ? 'Locatie' : 'Location'}</div>
                        <div className="font-medium">Weesp, The Netherlands</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fun decoration */}
                <div className="hidden md:flex items-center justify-center gap-4 text-5xl">
                  <span className="animate-float">📮</span>
                  <span className="animate-float" style={{ animationDelay: '0.3s' }}>💌</span>
                  <span className="animate-float" style={{ animationDelay: '0.6s' }}>✨</span>
                </div>
              </div>

              {/* Contact Form */}
              <div className="magical-card">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      {t('contact.name')}
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="rounded-xl"
                      placeholder={language === 'nl' ? 'Jan Jansen' : 'John Doe'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      {t('contact.email')}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="rounded-xl"
                      placeholder="jan@voorbeeld.nl"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      {t('contact.message')}
                    </label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="rounded-xl min-h-32 resize-none"
                      placeholder={language === 'nl' ? 'Schrijf je bericht hier...' : 'Write your message here...'}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">{t('common.loading')}</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {t('contact.send')}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
