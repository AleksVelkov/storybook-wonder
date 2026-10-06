import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { HelpCircle, BookOpen, Truck, CreditCard, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Help() {
  const { language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: language === 'nl' ? 'Hoe maak ik een gepersonaliseerd boek?' : 'How do I create a personalized book?',
      answer: language === 'nl' 
        ? 'Klik op "Maak je Boek" en volg de eenvoudige stappen. Kies eerst het aantal kinderen, vul hun namen in, selecteer hun voorkeuren, en kies het gewenste formaat (fysiek boek, luisterboek, of digitaal). Je kunt het verhaal volledig personaliseren!'
        : 'Click on "Create Your Book" and follow the simple steps. First choose the number of children, enter their names, select their preferences, and choose the desired format (physical book, audiobook, or digital). You can fully personalize the story!'
    },
    {
      question: language === 'nl' ? 'Wat zijn de levertijden?' : 'What are the delivery times?',
      answer: language === 'nl'
        ? 'Standaard verzending duurt 3-5 werkdagen. Bestellingen worden binnen 1-2 werkdagen verwerkt. Je ontvangt een track & trace code zodra je bestelling is verzonden. Gratis ophalen in Weesp is mogelijk binnen 1-2 werkdagen.'
        : 'Standard shipping takes 3-5 business days. Orders are processed within 1-2 business days. You will receive a tracking code once your order has been shipped. Free pickup in Weesp is available within 1-2 business days.'
    },
    {
      question: language === 'nl' ? 'Welke betaalmethoden accepteren jullie?' : 'What payment methods do you accept?',
      answer: language === 'nl'
        ? 'We accepteren Visa, Mastercard, American Express, PayPal, iDEAL en Apple Pay. Alle betalingen worden veilig verwerkt via Stripe met SSL-encryptie.'
        : 'We accept Visa, Mastercard, American Express, PayPal, iDEAL and Apple Pay. All payments are securely processed through Stripe with SSL encryption.'
    },
    {
      question: language === 'nl' ? 'Kan ik mijn bestelling annuleren of wijzigen?' : 'Can I cancel or modify my order?',
      answer: language === 'nl'
        ? 'Je kunt je bestelling annuleren of wijzigen binnen 1 uur na plaatsing. Neem daarna zo snel mogelijk contact met ons op via orders@sterrenverhalen.nl. Zodra de productie is gestart, kunnen we helaas geen wijzigingen meer doorvoeren.'
        : 'You can cancel or modify your order within 1 hour of placement. After that, please contact us as soon as possible at orders@sterrenverhalen.nl. Unfortunately, once production has started, we cannot make any changes.'
    },
    {
      question: language === 'nl' ? 'Wat is jullie retourbeleid?' : 'What is your return policy?',
      answer: language === 'nl'
        ? 'Standaard bestellingen kunnen binnen 30 dagen worden geretourneerd, sale artikelen binnen 14 dagen. Artikelen moeten ongebruikt en in originele staat zijn. Retourkosten zijn voor rekening van de klant. Zie onze Verzending & Retourneren pagina voor meer details.'
        : 'Standard orders can be returned within 30 days, sale items within 14 days. Items must be unused and in original condition. Return shipping costs are borne by the customer. See our Shipping & Returns page for more details.'
    },
    {
      question: language === 'nl' ? 'Zijn de boeken ook beschikbaar als luisterboek?' : 'Are the books also available as audiobooks?',
      answer: language === 'nl'
        ? 'Ja! Bij het aanmaken van je boek kun je kiezen voor een fysiek boek, luisterboek, of digitale versie. Je kunt ook combinaties kiezen voor een speciale prijs.'
        : 'Yes! When creating your book, you can choose a physical book, audiobook, or digital version. You can also choose combinations for a special price.'
    },
    {
      question: language === 'nl' ? 'Kan ik een cadeaubon kopen?' : 'Can I buy a gift voucher?',
      answer: language === 'nl'
        ? 'Momenteel bieden we geen fysieke cadeaubonnen aan, maar je kunt wel kortingscoupons aanvragen voor speciale gelegenheden. Neem contact met ons op via info@sterrenverhalen.nl.'
        : 'We currently do not offer physical gift vouchers, but you can request discount coupons for special occasions. Contact us at info@sterrenverhalen.nl.'
    },
    {
      question: language === 'nl' ? 'Hoe gebruik ik een kortingscode?' : 'How do I use a discount code?',
      answer: language === 'nl'
        ? 'In je winkelwagentje vind je een veld voor kortingscodes. Voer je code in en klik op "Toepassen". De korting wordt direct van je totaalbedrag afgetrokken. Let op: sommige kortingscodes kunnen maar één keer per klant gebruikt worden.'
        : 'In your shopping cart you will find a field for discount codes. Enter your code and click "Apply". The discount will be immediately deducted from your total amount. Note: some discount codes can only be used once per customer.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>
          {language === 'nl' ? 'Help & FAQ' : 'Help & FAQ'} | Sterren Verhalen
        </title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {language === 'nl' ? 'Help & Veelgestelde Vragen' : 'Help & Frequently Asked Questions'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {language === 'nl' 
                  ? 'Vind snel antwoorden op je vragen' 
                  : 'Find quick answers to your questions'}
              </p>
            </div>

            {/* Quick Contact Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <a href="mailto:info@sterrenverhalen.nl" className="magical-card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{language === 'nl' ? 'Email ons' : 'Email us'}</h3>
                    <p className="text-sm text-muted-foreground">info@sterrenverhalen.nl</p>
                  </div>
                </div>
              </a>

              <Link to="/contact" className="magical-card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{language === 'nl' ? 'Contactformulier' : 'Contact Form'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'nl' ? 'Stel je vraag' : 'Ask your question'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* FAQ Section */}
            <div className="magical-card">
              <h2 className="text-2xl font-bold mb-6">
                {language === 'nl' ? 'Veelgestelde Vragen' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-border last:border-0 pb-4">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left flex justify-between items-start gap-4 group"
                    >
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <span className="text-2xl text-muted-foreground group-hover:text-primary transition-colors">
                        {openFaq === index ? '−' : '+'}
                      </span>
                    </button>
                    {openFaq === index && (
                      <p className="mt-3 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Help Topics */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Link to="/shipping-returns" className="magical-card hover:shadow-lg transition-shadow text-center">
                <Truck className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">
                  {language === 'nl' ? 'Verzending & Retourneren' : 'Shipping & Returns'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Meer info over levering' : 'More info about delivery'}
                </p>
              </Link>

              <Link to="/shop" className="magical-card hover:shadow-lg transition-shadow text-center">
                <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">
                  {language === 'nl' ? 'Ontdek onze boeken' : 'Discover our books'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Bekijk alle verhalen' : 'View all stories'}
                </p>
              </Link>

              <Link to="/profile" className="magical-card hover:shadow-lg transition-shadow text-center">
                <CreditCard className="w-8 h-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">
                  {language === 'nl' ? 'Mijn Bestellingen' : 'My Orders'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Volg je bestelling' : 'Track your order'}
                </p>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

