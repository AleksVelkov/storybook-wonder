import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookCreationWizard } from '@/components/BookCreationWizard';
import { BooksGallery } from '@/components/BooksGallery';
import { Helmet } from 'react-helmet-async';
import { Sparkles, BookOpen } from 'lucide-react';

const Shop = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{language === 'nl' ? 'Maak je Boek - Sterren Verhalen' : 'Create Book - Sterren Verhalen'}</title>
        <meta 
          name="description" 
          content={language === 'nl' 
            ? 'Creëer een uniek, gepersonaliseerd kinderboek. Kies karakters, thema, en voeg een persoonlijke boodschap toe.' 
            : 'Create a unique, personalized children\'s book. Choose characters, theme, and add a personal message.'
          } 
        />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language === 'nl' ? 'Maak een Uniek Boek' : 'Create a Unique Book'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {language === 'nl' ? 'Ontwerp Jouw Verhaal' : 'Design Your Story'}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'nl' 
                  ? 'In een paar simpele stappen creëer je een magisch boek met jouw kind als de ster!'
                  : 'In a few simple steps, create a magical book with your child as the star!'
                }
              </p>
            </div>

            {/* Book Creation Wizard */}
            <BookCreationWizard />

            {/* Or Browse Our Collection */}
            <div className="mt-24">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full mb-4">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'nl' ? 'Onze Collectie' : 'Our Collection'}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {language === 'nl' ? 'Of Kies uit Onze Verhalen' : 'Or Choose from Our Stories'}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {language === 'nl' 
                    ? 'Ontdek onze gepersonaliseerde kinderboeken, ingedeeld per thema. Elk boek kan volledig gepersonaliseerd worden met de naam en kenmerken van je kind.'
                    : 'Discover our personalized children\'s books, organized by theme. Each book can be fully personalized with your child\'s name and features.'
                  }
                </p>
              </div>

              <BooksGallery />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Shop;
