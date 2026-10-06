import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';

const About = () => {
  const { t, language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{language === 'nl' ? 'Over Ons - Sterren Verhalen' : 'About Us - Sterren Verhalen'}</title>
        <meta 
          name="description" 
          content={language === 'nl' 
            ? 'Wij geloven dat elk kind een held is in hun eigen verhaal. Ontdek de magie achter onze kinderboeken.' 
            : 'We believe every child is a hero in their own story. Discover the magic behind our children\'s books.'
          } 
        />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t('about.title')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('about.subtitle')}
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
              {/* Our Story */}
              <div className="magical-card">
                <div className="text-5xl mb-6">📖</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {t('about.story.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.story.text')}
                </p>
              </div>

              {/* Our Mission */}
              <div className="magical-card">
                <div className="text-5xl mb-6">💫</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {t('about.mission.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.mission.text')}
                </p>
              </div>
            </div>

            {/* Characters Section */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                {language === 'nl' ? 'Kies Jouw Dier' : 'Choose Your Animal'}
              </h2>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {[
                  { emoji: '🐻', name: language === 'nl' ? 'Teddy Beer' : 'Teddy Bear', trait: language === 'nl' ? 'Moedig & Lief' : 'Brave & Kind' },
                  { emoji: '🐰', name: language === 'nl' ? 'Konijntje' : 'Bunny', trait: language === 'nl' ? 'Nieuwsgierig & Zacht' : 'Curious & Gentle' },
                  { emoji: '🐺', name: language === 'nl' ? 'Wolf' : 'Wolf', trait: language === 'nl' ? 'Vriendelijk & Wijs' : 'Friendly & Wise' },
                  { emoji: '👧', name: language === 'nl' ? 'Emma' : 'Emma', trait: language === 'nl' ? 'Dromerig & Avontuurlijk' : 'Dreamy & Adventurous' },
                ].map((character, index) => (
                  <div 
                    key={character.name}
                    className="group text-center"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-sunshine-light to-coral-light rounded-full flex items-center justify-center text-5xl shadow-soft group-hover:shadow-card group-hover:scale-110 transition-all duration-300 ease-bounce">
                      {character.emoji}
                    </div>
                    <h3 className="font-bold text-foreground">{character.name}</h3>
                    <p className="text-sm text-muted-foreground">{character.trait}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Values */}
            <div className="mt-16 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: '✨', title: language === 'nl' ? 'Magisch' : 'Magical', desc: language === 'nl' ? 'Elk verhaal is een avontuur' : 'Every story is an adventure' },
                { icon: '💝', title: language === 'nl' ? 'Met Liefde' : 'With Love', desc: language === 'nl' ? 'Gemaakt door ouders, voor ouders' : 'Made by parents, for parents' },
                { icon: '🌈', title: language === 'nl' ? 'Inclusief' : 'Inclusive', desc: language === 'nl' ? 'Verhalen voor iedereen' : 'Stories for everyone' },
              ].map((value, index) => (
                <div key={value.title} className="text-center p-6">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default About;
