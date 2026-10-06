import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield } from 'lucide-react';

export default function Privacy() {
  const { language } = useLanguage();

  const contentNl = {
    title: 'Privacybeleid',
    lastUpdated: 'Laatst bijgewerkt: December 2024',
    intro: 'Sterren Verhalen respecteert uw privacy en handelt in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG/GDPR). Dit privacybeleid legt uit hoe wij uw persoonlijke gegevens verzamelen, gebruiken en beschermen.',
    sections: [
      {
        title: '1. Welke Gegevens Verzamelen Wij?',
        content: 'Wij verzamelen de volgende gegevens wanneer u een bestelling plaatst:\n• Naam en contactgegevens (e-mail, telefoonnummer)\n• Bezorgadres\n• Betalingsgegevens (worden verwerkt door onze betaalpartner)\n• Inhoud van uw gepersonaliseerde boek (namen, boodschappen)\n• IP-adres en browsergegevens voor websiteverbetering'
      },
      {
        title: '2. Waarvoor Gebruiken Wij Uw Gegevens?',
        content: 'Wij gebruiken uw gegevens voor:\n• Het verwerken en leveren van uw bestelling\n• Communicatie over uw bestelling\n• Klantenservice\n• Verbetering van onze producten en diensten\n• Marketing (alleen met uw toestemming)'
      },
      {
        title: '3. Rechtsgrondslag',
        content: 'Wij verwerken uw gegevens op basis van:\n• Uitvoering van de overeenkomst (uw bestelling)\n• Wettelijke verplichtingen (zoals belastingadministratie)\n• Uw toestemming (voor marketing)\n• Gerechtvaardigd belang (websitebeveiliging en -verbetering)'
      },
      {
        title: '4. Delen van Gegevens',
        content: 'Wij delen uw gegevens alleen met:\n• Bezorgdiensten voor levering van uw bestelling\n• Betaaldiensten voor verwerking van betalingen\n• IT-dienstverleners die ons helpen de website te beheren\n\nWij verkopen uw gegevens nooit aan derden.'
      },
      {
        title: '5. Bewaartermijn',
        content: 'Wij bewaren uw gegevens:\n• Ordergegevens: 7 jaar (wettelijke verplichting)\n• Accountgegevens: zolang uw account actief is\n• Marketingvoorkeuren: tot u zich afmeldt'
      },
      {
        title: '6. Uw Rechten (GDPR)',
        content: 'U heeft het recht op:\n• Inzage in uw gegevens\n• Correctie van onjuiste gegevens\n• Verwijdering van uw gegevens ("recht om vergeten te worden")\n• Beperking van verwerking\n• Overdraagbaarheid van gegevens\n• Bezwaar tegen verwerking\n• Intrekking van toestemming\n\nNeem contact met ons op via info@sterrenverhalen.nl om uw rechten uit te oefenen.'
      },
      {
        title: '7. Beveiliging',
        content: 'Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen tegen ongeoorloofde toegang, wijziging, openbaarmaking of vernietiging. Onze website gebruikt SSL-encryptie.'
      },
      {
        title: '8. Cookies',
        content: 'Onze website gebruikt cookies voor:\n• Functionele doeleinden (winkelwagen, voorkeuren)\n• Analytische doeleinden (websitestatistieken)\n\nU kunt cookies beheren via uw browserinstellingen.'
      },
      {
        title: '9. Klachten',
        content: 'Heeft u een klacht over onze gegevensverwerking? Neem dan contact met ons op. U heeft ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).'
      },
      {
        title: '10. Contact',
        content: 'Voor vragen over dit privacybeleid:\n\nSterren Verhalen\nE-mail: info@sterrenverhalen.nl\nAmsterdam, Nederland'
      }
    ]
  };

  const contentEn = {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: December 2024',
    intro: 'Sterren Verhalen respects your privacy and acts in accordance with the General Data Protection Regulation (GDPR). This privacy policy explains how we collect, use, and protect your personal data.',
    sections: [
      {
        title: '1. What Data Do We Collect?',
        content: 'We collect the following data when you place an order:\n• Name and contact details (email, phone number)\n• Delivery address\n• Payment details (processed by our payment partner)\n• Content of your personalized book (names, messages)\n• IP address and browser data for website improvement'
      },
      {
        title: '2. Why Do We Use Your Data?',
        content: 'We use your data for:\n• Processing and delivering your order\n• Communication about your order\n• Customer service\n• Improvement of our products and services\n• Marketing (only with your consent)'
      },
      {
        title: '3. Legal Basis',
        content: 'We process your data based on:\n• Performance of the contract (your order)\n• Legal obligations (such as tax administration)\n• Your consent (for marketing)\n• Legitimate interest (website security and improvement)'
      },
      {
        title: '4. Sharing Data',
        content: 'We only share your data with:\n• Delivery services for delivery of your order\n• Payment services for processing payments\n• IT service providers who help us manage the website\n\nWe never sell your data to third parties.'
      },
      {
        title: '5. Retention Period',
        content: 'We retain your data:\n• Order data: 7 years (legal requirement)\n• Account data: as long as your account is active\n• Marketing preferences: until you unsubscribe'
      },
      {
        title: '6. Your Rights (GDPR)',
        content: 'You have the right to:\n• Access your data\n• Correct inaccurate data\n• Delete your data ("right to be forgotten")\n• Restrict processing\n• Data portability\n• Object to processing\n• Withdraw consent\n\nContact us at info@sterrenverhalen.nl to exercise your rights.'
      },
      {
        title: '7. Security',
        content: 'We take appropriate technical and organizational measures to protect your data against unauthorized access, modification, disclosure, or destruction. Our website uses SSL encryption.'
      },
      {
        title: '8. Cookies',
        content: 'Our website uses cookies for:\n• Functional purposes (shopping cart, preferences)\n• Analytical purposes (website statistics)\n\nYou can manage cookies via your browser settings.'
      },
      {
        title: '9. Complaints',
        content: 'Do you have a complaint about our data processing? Please contact us. You also have the right to file a complaint with the Dutch Data Protection Authority (autoriteitpersoonsgegevens.nl).'
      },
      {
        title: '10. Contact',
        content: 'For questions about this privacy policy:\n\nSterren Verhalen\nEmail: info@sterrenverhalen.nl\nAmsterdam, Netherlands'
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {content.title}
              </h1>
              <p className="text-muted-foreground">{content.lastUpdated}</p>
            </div>

            <div className="magical-card p-6 md:p-8 space-y-8">
              <p className="text-muted-foreground leading-relaxed">{content.intro}</p>
              
              {content.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
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
