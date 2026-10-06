import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookCreationWizard } from '@/components/BookCreationWizard';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const { language, t } = useLanguage();
  
  return (
    <>
      <Helmet>
        <title>{language === 'nl' ? 'Sterren Verhalen - Gepersonaliseerde Kinderboeken' : 'Sterren Verhalen - Personalized Children\'s Books'}</title>
        <meta 
          name="description" 
          content={language === 'nl' 
            ? 'Creëer een uniek, gepersonaliseerd kinderboek met jouw kind als hoofdpersonage. Kies het thema, de karakters en maak het magisch!' 
            : 'Create a unique, personalized children\'s book with your child as the main character. Choose the theme, characters and make it magical!'
          } 
        />
      </Helmet>
      <div className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
        <Header />
        <main className="flex-1 overflow-x-hidden w-full">
          <HeroSection />
          
          {/* Make Your Book Section */}
          <section id="make-book" className="py-16 md:py-24 bg-accent/30 overflow-x-hidden">
            <div className="container mx-auto px-4 overflow-x-hidden">
              {/* Section Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'nl' ? 'Maak Je Boek' : 'Make Your Book'}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {t('create.title')}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  {t('create.subtitle')}
                </p>

                {/* Description */}
                <div className="max-w-xl mx-auto mb-8">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">🪄 {language === 'nl' ? 'Volledig op maat:' : 'Fully custom:'}</span>{' '}
                      {language === 'nl'
                        ? 'Kies thema, dier, personages en meer. Ontwerp een uniek verhaal vanaf nul.'
                        : 'Choose theme, animal, characters and more. Design a unique story from scratch.'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Wizard Content */}
              <BookCreationWizard />
            </div>
          </section>
          
          <HowItWorksSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
