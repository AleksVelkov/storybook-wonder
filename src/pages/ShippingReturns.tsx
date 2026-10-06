import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Truck, RotateCcw, Clock, Euro, MapPin } from 'lucide-react';

export default function ShippingReturns() {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>
          {language === 'nl' ? 'Verzending & Retourneren' : 'Shipping & Returns'} | Sterren Verhalen
        </title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {language === 'nl' ? 'Verzending & Retourneren' : 'Shipping & Returns'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {language === 'nl' 
                  ? 'Alles wat je moet weten over verzending en retouren' 
                  : 'Everything you need to know about shipping and returns'}
              </p>
            </div>

            {/* Shipping Section */}
            <div className="magical-card mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">
                  {language === 'nl' ? 'Verzendopties' : 'Shipping Options'}
                </h2>
              </div>

              <div className="space-y-6">
                {/* Standard Shipping */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {language === 'nl' ? 'Standaard verzending met tracking' : 'Standard Shipping with Tracking'}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4" />
                          <span>
                            <strong>€4.95</strong> {language === 'nl' ? 'verzendkosten' : 'shipping cost'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {language === 'nl' 
                              ? '3-5 werkdagen levertijd' 
                              : '3-5 business days delivery'}
                          </span>
                        </div>
                        <div className="p-2 bg-green-100 rounded-md mt-2">
                          <span className="text-green-800 font-medium">
                            ✨ {language === 'nl' 
                              ? 'GRATIS verzending bij bestellingen boven €50!' 
                              : 'FREE shipping on orders above €50!'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Option */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {language === 'nl' ? 'Gratis ophalen in Weesp' : 'Free Pickup in Weesp'}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4" />
                          <span>
                            <strong>{language === 'nl' ? 'GRATIS' : 'FREE'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {language === 'nl' 
                              ? 'Klaar voor ophalen binnen 1-2 werkdagen' 
                              : 'Ready for pickup within 1-2 business days'}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">
                          {language === 'nl' 
                            ? 'Je ontvangt een e-mail wanneer je bestelling klaar staat voor ophalen.' 
                            : 'You will receive an email when your order is ready for pickup.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Time */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold mb-2">
                    {language === 'nl' ? 'Verwerkingstijd' : 'Processing Time'}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {language === 'nl' 
                      ? 'Alle bestellingen worden binnen 1-2 werkdagen verwerkt. Je ontvangt een verzendbevestiging met track & trace informatie zodra je bestelling is verzonden.' 
                      : 'All orders are processed within 1-2 business days. You will receive a shipping confirmation with tracking information once your order has been shipped.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Returns Section */}
            <div className="magical-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">
                  {language === 'nl' ? 'Retourbeleid' : 'Return Policy'}
                </h2>
              </div>

              <div className="space-y-6">
                {/* Return Periods */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <h3 className="font-semibold text-lg mb-2 text-orange-900">
                      {language === 'nl' ? 'Sale artikelen' : 'Sale Items'}
                    </h3>
                    <p className="text-sm text-orange-800">
                      <Clock className="w-4 h-4 inline mr-1" />
                      <strong>14 {language === 'nl' ? 'dagen' : 'days'}</strong> {language === 'nl' ? 'na levering' : 'after delivery'}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-lg mb-2 text-blue-900">
                      {language === 'nl' ? 'Standaard bestellingen' : 'Standard Orders'}
                    </h3>
                    <p className="text-sm text-blue-800">
                      <Clock className="w-4 h-4 inline mr-1" />
                      <strong>30 {language === 'nl' ? 'dagen' : 'days'}</strong> {language === 'nl' ? 'na levering' : 'after delivery'}
                    </p>
                  </div>
                </div>

                {/* Return Conditions */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold mb-3">
                    {language === 'nl' ? 'Retourvoorwaarden' : 'Return Conditions'}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>
                        {language === 'nl' 
                          ? 'Artikelen moeten ongebruikt en in originele staat zijn' 
                          : 'Items must be unused and in original condition'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>
                        {language === 'nl' 
                          ? 'Originele verpakking en labels moeten intact zijn' 
                          : 'Original packaging and labels must be intact'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>
                        {language === 'nl' 
                          ? 'Inclusief aankoopbewijs of bestelnummer' 
                          : 'Include proof of purchase or order number'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Return Costs */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    {language === 'nl' ? 'Retourkosten' : 'Return Shipping Costs'}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {language === 'nl' 
                      ? 'De kosten voor het terugsturen van artikelen zijn voor rekening van de klant. We raden aan om een traceerbare verzendmethode te gebruiken.' 
                      : 'The cost of returning items is borne by the customer. We recommend using a trackable shipping method.'}
                  </p>
                </div>

                {/* How to Return */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold mb-3">
                    {language === 'nl' ? 'Hoe retourneren?' : 'How to Return?'}
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                    <li>
                      {language === 'nl' 
                        ? 'Neem contact op via orders@sterrenverhalen.nl met je bestelnummer' 
                        : 'Contact us at orders@sterrenverhalen.nl with your order number'}
                    </li>
                    <li>
                      {language === 'nl' 
                        ? 'We sturen je retourinstructies en ons adres' 
                        : 'We will send you return instructions and our address'}
                    </li>
                    <li>
                      {language === 'nl' 
                        ? 'Pak de artikelen veilig in en verzend ze naar ons' 
                        : 'Pack the items safely and ship them to us'}
                    </li>
                    <li>
                      {language === 'nl' 
                        ? 'Na ontvangst verwerken we je retour binnen 5-7 werkdagen' 
                        : 'Upon receipt, we process your return within 5-7 business days'}
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl text-center">
              <h3 className="font-semibold text-lg mb-2">
                {language === 'nl' ? 'Vragen?' : 'Questions?'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'nl' 
                  ? 'Neem gerust contact met ons op voor meer informatie' 
                  : 'Feel free to contact us for more information'}
              </p>
              <a 
                href="mailto:orders@sterrenverhalen.nl" 
                className="text-primary font-medium hover:underline"
              >
                orders@sterrenverhalen.nl
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}


