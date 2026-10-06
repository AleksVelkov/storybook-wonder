import { useLanguage } from '@/contexts/LanguageContext';

export function HowItWorksSection() {
  const { language } = useLanguage();

  const steps = [
    {
      emoji: '📚',
      titleNl: 'Kies Je Verhaal',
      titleEn: 'Choose Your Story',
      descNl: 'Kies uit onze prachtige voorgeselecteerde verhalen of creëer een volledig uniek boek op maat.',
      descEn: 'Choose from our beautiful pre-selected stories or create a completely unique custom book.',
      color: 'bg-purple-100',
    },
    {
      emoji: '👦',
      titleNl: 'Bouw Je Karakter',
      titleEn: 'Build Your Character',
      descNl: 'Kies het geslacht, huidskleur, haarkleur, kapsel, oogkleur en of je kind een bril draagt. Of klik op "Verras me!" voor een willekeurig karakter.',
      descEn: 'Choose the gender, skin tone, hair color, hairstyle, eye color and whether your child wears glasses. Or click "Surprise me!" for a random character.',
      color: 'bg-pink-100',
    },
    {
      emoji: '✍️',
      titleNl: 'Personaliseer Details',
      titleEn: 'Personalize Details',
      descNl: 'Voeg de naam, leeftijd, hobby\'s, favoriete eten en interessante weetjes van je kind toe om het verhaal extra speciaal te maken.',
      descEn: 'Add your child\'s name, age, hobbies, favorite food and interesting facts to make the story extra special.',
      color: 'bg-blue-100',
    },
    {
      emoji: '📖',
      titleNl: 'Kies Je Formaat',
      titleEn: 'Choose Your Format',
      descNl: 'Kies tussen een gedrukt boek, audioboek, digitale versie, of een complete bundel. Alle formats zijn beschikbaar.',
      descEn: 'Choose between a printed book, audiobook, digital version, or a complete bundle. All formats are available.',
      color: 'bg-green-100',
    },
    {
      emoji: '🎨',
      titleNl: 'Wij Maken Het',
      titleEn: 'We Create It',
      descNl: 'Ons team maakt jouw gepersonaliseerde boek met prachtige illustraties en een uniek verhaal speciaal voor je kind.',
      descEn: 'Our team creates your personalized book with beautiful illustrations and a unique story specially for your child.',
      color: 'bg-yellow-100',
    },
    {
      emoji: '📦',
      titleNl: 'Levering Bij Jou Thuis',
      titleEn: 'Delivery To Your Home',
      descNl: 'Je boek wordt binnen 5-7 werkdagen bij je bezorgd. Gratis verzending boven €50 of gratis afhalen in Weesp!',
      descEn: 'Your book will be delivered within 5-7 business days. Free shipping over €50 or free pickup in Weesp!',
      color: 'bg-orange-100',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'nl' ? 'Hoe Het Werkt' : 'How It Works'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'nl' 
              ? 'In 6 eenvoudige stappen van idee tot een magisch gepersonaliseerd kinderboek'
              : 'In 6 simple steps from idea to a magical personalized children\'s book'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="magical-card p-6 group hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl ${step.color} flex items-center justify-center text-4xl shadow-soft group-hover:scale-110 transition-all duration-300`}>
                {step.emoji}
              </div>
              <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-sm font-bold text-primary mb-3">
                Stap {index + 1}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {language === 'nl' ? step.titleNl : step.titleEn}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {language === 'nl' ? step.descNl : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
