import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText } from 'lucide-react';

export default function Terms() {
  const { language } = useLanguage();

  const contentNl = {
    title: 'Algemene Voorwaarden',
    lastUpdated: 'Laatst bijgewerkt: December 2024',
    sections: [
      {
        title: '1. Algemeen',
        content: 'Deze algemene voorwaarden zijn van toepassing op alle bestellingen en overeenkomsten bij Sterren Verhalen. Door een bestelling te plaatsen, gaat u akkoord met deze voorwaarden.'
      },
      {
        title: '2. Producten en Diensten',
        content: 'Sterren Verhalen biedt gepersonaliseerde kinderboeken aan. Elk boek wordt op maat gemaakt op basis van de door u opgegeven specificaties. Vanwege het gepersonaliseerde karakter van onze producten, is het niet mogelijk om bestellingen te annuleren of te retourneren nadat de productie is gestart.'
      },
      {
        title: '3. Prijzen en Betaling',
        content: 'Alle prijzen zijn in Euro\'s en inclusief BTW. De prijzen kunnen variëren afhankelijk van de gekozen opties (aantal karakters, pagina\'s, formaat). Kortingen worden automatisch toegepast: 10% bij 2 boeken, 20% bij 3 of meer boeken.'
      },
      {
        title: '4. Levering',
        content: 'De leveringstijd bedraagt doorgaans 2-3 weken na bevestiging van uw bestelling. Digitale versies en audioboeken worden per e-mail geleverd zodra ze beschikbaar zijn. Voor fysieke boeken ontvangt u een track & trace code.'
      },
      {
        title: '5. Intellectueel Eigendom',
        content: 'Alle illustraties, verhalen en ontwerpen zijn eigendom van Sterren Verhalen. Het is niet toegestaan om onze producten te reproduceren of commercieel te gebruiken zonder schriftelijke toestemming.'
      },
      {
        title: '6. Aansprakelijkheid',
        content: 'Sterren Verhalen is niet aansprakelijk voor indirecte schade of gevolgschade. Onze aansprakelijkheid is beperkt tot het bedrag van de bestelling.'
      },
      {
        title: '7. Klachten',
        content: 'Heeft u een klacht? Neem dan binnen 14 dagen na ontvangst contact met ons op via info@sterrenverhalen.nl. Wij streven ernaar uw klacht binnen 5 werkdagen te behandelen.'
      },
      {
        title: '8. Toepasselijk Recht',
        content: 'Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.'
      }
    ]
  };

  const contentEn = {
    title: 'Terms and Conditions',
    lastUpdated: 'Last updated: December 2024',
    sections: [
      {
        title: '1. General',
        content: 'These terms and conditions apply to all orders and agreements at Sterren Verhalen. By placing an order, you agree to these terms.'
      },
      {
        title: '2. Products and Services',
        content: 'Sterren Verhalen offers personalized children\'s books. Each book is custom-made based on the specifications you provide. Due to the personalized nature of our products, it is not possible to cancel or return orders once production has started.'
      },
      {
        title: '3. Prices and Payment',
        content: 'All prices are in Euros and include VAT. Prices may vary depending on the chosen options (number of characters, pages, format). Discounts are automatically applied: 10% for 2 books, 20% for 3 or more books.'
      },
      {
        title: '4. Delivery',
        content: 'Delivery time is usually 2-3 weeks after confirmation of your order. Digital versions and audiobooks are delivered by email as soon as they are available. For physical books, you will receive a track & trace code.'
      },
      {
        title: '5. Intellectual Property',
        content: 'All illustrations, stories, and designs are the property of Sterren Verhalen. It is not permitted to reproduce or commercially use our products without written permission.'
      },
      {
        title: '6. Liability',
        content: 'Sterren Verhalen is not liable for indirect or consequential damages. Our liability is limited to the amount of the order.'
      },
      {
        title: '7. Complaints',
        content: 'Do you have a complaint? Please contact us within 14 days of receipt at info@sterrenverhalen.nl. We aim to handle your complaint within 5 business days.'
      },
      {
        title: '8. Applicable Law',
        content: 'Dutch law applies to these terms. Disputes will be submitted to the competent court in the Netherlands.'
      }
    ]
  };

  const content = language === 'nl' ? contentNl : contentEn;

  return (
    <>
      <Helmet>
        <title>{content.title} | Sterren Verhalen</title>
        <meta name="description" content={content.title} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {content.title}
              </h1>
              <p className="text-muted-foreground">{content.lastUpdated}</p>
            </div>

            <div className="magical-card p-6 md:p-8 space-y-8">
              {content.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
