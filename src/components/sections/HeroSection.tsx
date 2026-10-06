import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, Heart } from 'lucide-react';
import heroImage from '@/assets/hero-illustration.jpg';

export function HeroSection() {
  const { t, language } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Magical storybook characters"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>

      {/* Floating decorations */}
      <div className="absolute top-20 left-10 text-5xl animate-float opacity-80">⭐</div>
      <div className="absolute top-40 right-20 text-4xl animate-float opacity-70" style={{ animationDelay: '0.5s' }}>✨</div>
      <div className="absolute bottom-32 left-20 text-3xl animate-float opacity-60" style={{ animationDelay: '1s' }}>🌙</div>
      <div className="absolute top-60 right-40 text-3xl animate-float opacity-50" style={{ animationDelay: '1.5s' }}>🌟</div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'nl' ? 'Gepersonaliseerde Kinderboeken' : 'Personalized Children\'s Books'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/shop">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                <Sparkles className="w-5 h-5 mr-2" />
                {t('hero.cta')}
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto">
                {t('hero.secondary')}
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="w-5 h-5 text-primary" />
              <span>{language === 'nl' ? '100% Uniek & Persoonlijk' : '100% Unique & Personal'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xl">🎨</span>
              <span>{language === 'nl' ? 'Prachtige Illustraties' : 'Beautiful Illustrations'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
