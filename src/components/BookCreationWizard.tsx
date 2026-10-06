import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CharacterBuilder } from '@/components/CharacterBuilder';
import { CharacterFeatures } from '@/components/CharacterAvatar';
import { Users, Palette, BookOpen, PawPrint, MessageSquare, Sparkles, ChevronRight, ChevronLeft, Check, Plus, Package, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface BookConfig {
  characters: number;
  characterNames: string[];
  characterAges: string[];
  characterFeatures: CharacterFeatures[];
  theme: string;
  customTheme: string;
  hobbies: string;
  favoriteFood: string;
  interestingFact: string;
  pages: number;
  animal: string;
  customAnimal: string;
  message: string;
  hasMessage: boolean;
  format: 'book' | 'book_audio' | 'book_digital' | 'book_audio_digital';
}

// Pricing constants
const PRICING = {
  basePrice: 24.95,
  extraCharacter: 5.00,
  pagePrice: 0.75, // per page above 8
  messagePrice: 2.50,
  formats: {
    book: 0,
    book_audio: 8.95,
    book_digital: 4.95,
    book_audio_digital: 11.95,
  }
};

const THEMES = [
  { id: 'adventure', labelNl: 'Avontuur', labelEn: 'Adventure', emoji: '🗺️' },
  { id: 'friendship', labelNl: 'Vriendschap', labelEn: 'Friendship', emoji: '💕' },
  { id: 'magic', labelNl: 'Magie', labelEn: 'Magic', emoji: '✨' },
  { id: 'nature', labelNl: 'Natuur', labelEn: 'Nature', emoji: '🌳' },
  { id: 'space', labelNl: 'Ruimte', labelEn: 'Space', emoji: '🚀' },
  { id: 'dreams', labelNl: 'Dromen', labelEn: 'Dreams', emoji: '🌙' },
];

const ANIMALS = [
  { id: 'bear', labelNl: 'Beer', labelEn: 'Bear', emoji: '🐻' },
  { id: 'rabbit', labelNl: 'Konijn', labelEn: 'Rabbit', emoji: '🐰' },
  { id: 'fox', labelNl: 'Vos', labelEn: 'Fox', emoji: '🦊' },
  { id: 'owl', labelNl: 'Uil', labelEn: 'Owl', emoji: '🦉' },
  { id: 'cat', labelNl: 'Kat', labelEn: 'Cat', emoji: '🐱' },
  { id: 'dog', labelNl: 'Hond', labelEn: 'Dog', emoji: '🐕' },
  { id: 'random', labelNl: 'Verras me!', labelEn: 'Surprise me!', emoji: '🎲' },
];

const PAGE_OPTIONS = [8, 12, 16, 20, 24];

const FORMAT_OPTIONS = [
  { id: 'book', labelNl: 'Alleen Gedrukt Boek', labelEn: 'Printed Book Only', emoji: '📖' },
  { id: 'book_audio', labelNl: 'Gedrukt Boek + Audioboek', labelEn: 'Printed Book + Audiobook', emoji: '📖🎧' },
  { id: 'book_digital', labelNl: 'Gedrukt Boek + Digitale Versie', labelEn: 'Printed Book + Digital Version', emoji: '📖💻' },
  { id: 'book_audio_digital', labelNl: 'Complete Bundel (Boek + Audio + Digitaal)', labelEn: 'Complete Bundle (Book + Audio + Digital)', emoji: '📖🎧💻' },
] as const;

// Session storage keys for preserving progress
const SESSION_STORAGE_KEY = 'bookCreationProgress';
const SESSION_STEP_KEY = 'bookCreationStep';

export function BookCreationWizard() {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BookConfig>({
    characters: 1,
    characterNames: [''],
    characterAges: [''],
    characterFeatures: [{
      gender: 'boy',
      skinTone: 'medium',
      hairColor: 'brown',
      hairStyle: 'short',
      eyeColor: 'brown',
      hasGlasses: false,
    }],
    theme: '',
    customTheme: '',
    hobbies: '',
    favoriteFood: '',
    interestingFact: '',
    pages: 16,
    animal: '',
    customAnimal: '',
    message: '',
    hasMessage: false,
    format: 'book',
  });

  const totalSteps = 7;

  // Load saved progress from sessionStorage on mount
  useEffect(() => {
    try {
      const savedConfig = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const savedStep = sessionStorage.getItem(SESSION_STEP_KEY);
      
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        
        // Only show notification if there's actual progress (step > 1 or data filled)
        const hasActualProgress = savedStep && parseInt(savedStep) > 1;
        const hasActualData = parsedConfig.characters?.some((c: any) => c.name) ||
                              parsedConfig.theme ||
                              parsedConfig.animal;
        
        if (hasActualProgress || hasActualData) {
          toast.info(language === 'nl' ? 'Vorige sessie hersteld' : 'Previous session restored', {
            description: language === 'nl' ? 'Je kunt doorgaan waar je gebleven was' : 'You can continue where you left off'
          });
        }
      }
      
      if (savedStep) {
        setStep(parseInt(savedStep));
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  }, []); // Only run on mount

  // Save progress to sessionStorage whenever config or step changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(config));
      sessionStorage.setItem(SESSION_STEP_KEY, step.toString());
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [config, step]);

  // Clear session storage
  const clearSession = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STEP_KEY);
      
      // Reset to initial state
      setConfig({
        characters: 1,
        characterNames: [''],
        characterAges: [''],
        characterFeatures: [{
          gender: 'boy',
          skinTone: 'medium',
          hairColor: 'brown',
          hairStyle: 'short',
          eyeColor: 'brown',
          hasGlasses: false,
        }],
        theme: '',
        customTheme: '',
        hobbies: '',
        favoriteFood: '',
        interestingFact: '',
        pages: 16,
        animal: '',
        customAnimal: '',
        message: '',
        hasMessage: false,
        format: 'book',
      });
      setStep(1);
      
      toast.success(language === 'nl' ? 'Opnieuw beginnen' : 'Starting fresh');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const updateCharacterCount = (count: number) => {
    const names = [...config.characterNames];
    const ages = [...config.characterAges];
    const features = [...config.characterFeatures];
    
    const defaultFeatures: CharacterFeatures = {
      gender: 'boy',
      skinTone: 'medium',
      hairColor: 'brown',
      hairStyle: 'short',
      eyeColor: 'brown',
      hasGlasses: false,
    };
    
    while (names.length < count) {
      names.push('');
      ages.push('');
      features.push({ ...defaultFeatures });
    }
    while (names.length > count) {
      names.pop();
      ages.pop();
      features.pop();
    }
    
    setConfig({ ...config, characters: count, characterNames: names, characterAges: ages, characterFeatures: features });
  };

  const updateCharacterFeatures = (index: number, newFeatures: CharacterFeatures) => {
    const features = [...config.characterFeatures];
    features[index] = newFeatures;
    setConfig({ ...config, characterFeatures: features });
  };

  const updateCharacterName = (index: number, name: string) => {
    const names = [...config.characterNames];
    names[index] = name;
    setConfig({ ...config, characterNames: names });
  };

  const updateCharacterAge = (index: number, age: string) => {
    const ages = [...config.characterAges];
    ages[index] = age;
    setConfig({ ...config, characterAges: ages });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: 
        return config.characters > 0 && 
          config.characterNames.every(name => name.trim() !== '') &&
          config.characterAges.every(age => age.trim() !== '');
      case 2: 
        return config.theme !== '' || config.customTheme.trim() !== '';
      case 3: 
        return true; // Extra details are optional
      case 4: 
        return config.pages > 0;
      case 5: 
        return config.animal !== '' || config.customAnimal.trim() !== '';
      case 6: 
        return true; // Message is optional
      case 7:
        return config.format !== undefined;
      default: 
        return false;
    }
  };

  const nextStep = () => {
    if (step < totalSteps && isStepValid()) {
      // Use setTimeout to ensure smooth transition and avoid potential render freeze
      const nextStepNum = step + 1;
      setStep(nextStepNum);
      // Scroll to top of wizard for better UX
      window.scrollTo({ top: document.getElementById('make-book')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const calculatePriceBreakdown = () => {
    const breakdown = {
      base: PRICING.basePrice,
      characters: (config.characters - 1) * PRICING.extraCharacter,
      pages: (config.pages - 8) * PRICING.pagePrice,
      message: config.hasMessage && config.message.trim() ? PRICING.messagePrice : 0,
      format: PRICING.formats[config.format],
    };
    const total = breakdown.base + breakdown.characters + breakdown.pages + breakdown.message + breakdown.format;
    return { breakdown, total };
  };

  const getThemeDisplay = () => {
    if (config.customTheme) return config.customTheme;
    const theme = THEMES.find(th => th.id === config.theme);
    return theme ? (language === 'nl' ? theme.labelNl : theme.labelEn) : '';
  };

  const getAnimalDisplay = () => {
    if (config.customAnimal) return config.customAnimal;
    const animal = ANIMALS.find(a => a.id === config.animal);
    return animal ? (language === 'nl' ? animal.labelNl : animal.labelEn) : '';
  };

  const getFormatDisplay = () => {
    const format = FORMAT_OPTIONS.find(f => f.id === config.format);
    return format ? (language === 'nl' ? format.labelNl : format.labelEn) : '';
  };

  const handleComplete = () => {
    try {
      const { total } = calculatePriceBreakdown();
      addItem({
        id: `custom-book-${Date.now()}`,
        title: `Sterren Verhaal - ${config.characterNames.join(', ')}`,
        titleEn: `Star Story - ${config.characterNames.join(', ')}`,
        image: '/placeholder.svg',
        formats: { 
          book: true, 
          audiobook: config.format === 'book_audio' || config.format === 'book_audio_digital',
          digital: config.format === 'book_digital' || config.format === 'book_audio_digital'
        },
        price: total,
        personalization: {
          childName: config.characterNames.join(', '),
          childAge: config.characterAges.join(', '),
          hobbies: config.hobbies || config.theme || config.customTheme,
          favoriteFood: config.favoriteFood,
          interestingFact: config.interestingFact,
          personalMessage: config.message || '',
          theme: config.theme || config.customTheme,
          animal: config.animal || config.customAnimal,
          pageCount: config.pages,
          character: config.characterFeatures[0], // Primary character for single avatar
          // Store all characters for multi-character books
          allCharacters: config.characterNames.map((name, index) => ({
            name,
            age: config.characterAges[index],
            features: config.characterFeatures[index]
          }))
        }
      });

      // Clear session storage after successful completion
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STEP_KEY);
      } catch (error) {
        console.error('Error clearing session:', error);
      }

      toast.success(language === 'nl' ? 'Toegevoegd aan winkelwagen!' : 'Added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error completing book creation:', error);
      toast.error(language === 'nl' ? 'Er ging iets mis. Probeer het opnieuw.' : 'Something went wrong. Please try again.');
    }
  };

  const { breakdown, total } = calculatePriceBreakdown();

  // Price display component
  const PriceTag = ({ label, price, highlight = false }: { label: string; price: number; highlight?: boolean }) => (
    <div className={`flex justify-between text-sm ${highlight ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
      <span>{label}</span>
      <span>+€{price.toFixed(2)}</span>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4 overflow-x-hidden">
      {/* Header with Start Fresh button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          {language === 'nl' ? 'Creëer je boek' : 'Create your book'}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={clearSession}
          className="text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          {language === 'nl' ? 'Opnieuw Beginnen' : 'Start Fresh'}
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mb-8 overflow-x-hidden">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold transition-all duration-300 text-sm ${
                s < step
                  ? 'bg-primary text-primary-foreground'
                  : s === step
                  ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="magical-card p-4 md:p-8 animate-fade-in" key={step}>
        {/* Step 1: Characters count + names */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {t('wizard.characters.title')}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">{t('wizard.characters.subtitle')}</p>
            </div>
            
            {/* Character count selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => updateCharacterCount(num)}
                  className={`p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    config.characters === num
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="text-xl md:text-2xl mb-1">
                    {num === 1 ? '👤' : num === 2 ? '👥' : num === 3 ? '👨‍👩‍👧' : '👨‍👩‍👧‍👦'}
                  </div>
                  <div className="font-bold text-foreground text-xs md:text-sm">
                    {num === 4 ? `${num}+` : num} {num === 1 
                      ? (language === 'nl' ? 'kind' : 'child')
                      : (language === 'nl' ? 'kinderen' : 'children')
                    }
                  </div>
                  {num > 1 && (
                    <div className="text-xs text-primary mt-1">
                      +€{((num - 1) * PRICING.extraCharacter).toFixed(2)}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Character name inputs and appearance */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <h3 className="font-semibold text-foreground text-sm md:text-base mb-3">
                  {language === 'nl' ? 'Namen en Uiterlijk van de Karakters' : 'Character Names & Appearance'}
                </h3>
                {config.characterNames.map((name, index) => (
                  <div key={index} className="space-y-3 mb-6 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    {/* Name & Age Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">⭐</span>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs sm:text-sm font-semibold mb-1 block">
                            {language === 'nl' ? `Kind ${index + 1} - Naam *` : `Child ${index + 1} - Name *`}
                          </label>
                          <Input
                            value={name}
                            onChange={(e) => updateCharacterName(index, e.target.value)}
                            placeholder={language === 'nl' ? `bijv. Emma` : `e.g. Emma`}
                            className="rounded-xl text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">🎂</span>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs sm:text-sm font-semibold mb-1 block">
                            {language === 'nl' ? `Leeftijd *` : `Age *`}
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="18"
                            value={config.characterAges[index] || ''}
                            onChange={(e) => updateCharacterAge(index, e.target.value)}
                            placeholder={language === 'nl' ? `bijv. 5` : `e.g. 5`}
                            className="rounded-xl text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Character Builder */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-purple-300">
                      <h4 className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
                        <span className="text-base">👤</span>
                        <span className="truncate">{language === 'nl' ? `Hoe ziet ${name || `kind ${index + 1}`} eruit?` : `What does ${name || `child ${index + 1}`} look like?`}</span>
                      </h4>
                      <CharacterBuilder 
                        initialFeatures={config.characterFeatures[index]}
                        onCharacterChange={(features) => updateCharacterFeatures(index, features)}
                      />
                    </div>

                    {index < config.characterNames.length - 1 && (
                      <div className="border-t border-purple-300 mt-3"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price indicator */}
            <div className="p-3 bg-accent/20 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'nl' ? 'Basisprijs:' : 'Base price:'}</span>
                <span className="font-bold text-foreground">€{PRICING.basePrice.toFixed(2)}</span>
              </div>
              {config.characters > 1 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>{language === 'nl' ? 'Extra karakters:' : 'Extra characters:'}</span>
                  <span>+€{((config.characters - 1) * PRICING.extraCharacter).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Theme */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Palette className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {t('wizard.theme.title')}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">{t('wizard.theme.subtitle')}</p>
            </div>
            
            {/* Preset themes */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setConfig({ ...config, theme: theme.id, customTheme: '' })}
                  className={`p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    config.theme === theme.id && !config.customTheme
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl md:text-3xl mb-2">{theme.emoji}</div>
                  <div className="font-bold text-foreground text-xs md:text-sm">
                    {language === 'nl' ? theme.labelNl : theme.labelEn}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom theme input */}
            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                <Plus className="w-4 h-4" />
                {language === 'nl' ? 'Of verzin je eigen thema' : 'Or create your own theme'}
              </h3>
              <Input
                value={config.customTheme}
                onChange={(e) => setConfig({ ...config, customTheme: e.target.value, theme: '' })}
                placeholder={language === 'nl' ? 'Bijv. Piraten, Dinosaurussen, Prinsessen...' : 'E.g. Pirates, Dinosaurs, Princesses...'}
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Step 3: Extra Details (Optional) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {language === 'nl' ? 'Maak het Extra Speciaal' : 'Make it Extra Special'}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {language === 'nl' ? 'Voeg persoonlijke details toe (optioneel)' : 'Add personal details (optional)'}
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-4">
              {/* Hobbies */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  🎨 {language === 'nl' ? "Hobby's / Interesses" : 'Hobbies / Interests'}
                </label>
                <Input
                  value={config.hobbies}
                  onChange={(e) => setConfig({ ...config, hobbies: e.target.value })}
                  placeholder={language === 'nl' ? 'bijv. voetbal, tekenen, dansen' : 'e.g. soccer, drawing, dancing'}
                  className="rounded-xl"
                />
              </div>

              {/* Favorite Food */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  🍕 {language === 'nl' ? 'Favoriete Eten' : 'Favorite Food'}
                </label>
                <Input
                  value={config.favoriteFood}
                  onChange={(e) => setConfig({ ...config, favoriteFood: e.target.value })}
                  placeholder={language === 'nl' ? 'bijv. pizza, pannenkoeken, frietjes' : 'e.g. pizza, pancakes, fries'}
                  className="rounded-xl"
                />
              </div>

              {/* Interesting Fact */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  💡 {language === 'nl' ? 'Interessant Feitje' : 'Interesting Fact'}
                </label>
                <Input
                  value={config.interestingFact}
                  onChange={(e) => setConfig({ ...config, interestingFact: e.target.value })}
                  placeholder={language === 'nl' ? 'bijv. Houdt van dinosaurussen, heeft een kat' : 'e.g. Loves dinosaurs, has a cat'}
                  className="rounded-xl"
                />
              </div>

              <div className="bg-accent/30 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' 
                    ? '💡 Deze details maken het verhaal nog persoonlijker en unieker!'
                    : '💡 These details make the story even more personal and unique!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pages */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {t('wizard.pages.title')}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">{t('wizard.pages.subtitle')}</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {PAGE_OPTIONS.map((pages) => (
                <button
                  key={pages}
                  onClick={() => setConfig({ ...config, pages })}
                  className={`p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    config.pages === pages
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="text-xl md:text-2xl font-bold text-foreground">{pages}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'nl' ? "pagina's" : 'pages'}
                  </div>
                  {pages > 8 && (
                    <div className="text-xs text-primary mt-1">
                      +€{((pages - 8) * PRICING.pagePrice).toFixed(2)}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Price indicator */}
            <div className="p-3 bg-accent/20 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'nl' ? "Pagina's extra:" : 'Pages extra:'}</span>
                <span className="font-bold text-foreground">
                  {config.pages > 8 ? `+€${((config.pages - 8) * PRICING.pagePrice).toFixed(2)}` : '€0.00'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Animal */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <PawPrint className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {t('wizard.animal.title')}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">{t('wizard.animal.subtitle')}</p>
            </div>
            
            {/* Preset animals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ANIMALS.map((animal) => (
                <button
                  key={animal.id}
                  onClick={() => setConfig({ ...config, animal: animal.id, customAnimal: '' })}
                  className={`p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    config.animal === animal.id && !config.customAnimal
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl md:text-3xl mb-2">{animal.emoji}</div>
                  <div className="font-bold text-foreground text-xs md:text-sm">
                    {language === 'nl' ? animal.labelNl : animal.labelEn}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom animal input */}
            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                <Plus className="w-4 h-4" />
                {language === 'nl' ? 'Of kies je eigen dier' : 'Or choose your own animal'}
              </h3>
              <Input
                value={config.customAnimal}
                onChange={(e) => setConfig({ ...config, customAnimal: e.target.value, animal: '' })}
                placeholder={language === 'nl' ? 'Bijv. Eenhoorn, Draak, Panda...' : 'E.g. Unicorn, Dragon, Panda...'}
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Step 6: Message (for back of book) - Optional */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {t('wizard.message.title')}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">{t('wizard.message.subtitle')}</p>
            </div>
            
            {/* Optional toggle */}
            <div className="flex items-center gap-3 p-4 bg-accent/20 rounded-xl">
              <Checkbox
                id="hasMessage"
                checked={config.hasMessage}
                onCheckedChange={(checked) => setConfig({ ...config, hasMessage: checked as boolean })}
              />
              <label htmlFor="hasMessage" className="text-sm font-medium cursor-pointer flex-1">
                {language === 'nl' 
                  ? 'Ja, ik wil een persoonlijke boodschap toevoegen' 
                  : 'Yes, I want to add a personal message'}
              </label>
              <span className="text-sm text-primary font-bold">+€{PRICING.messagePrice.toFixed(2)}</span>
            </div>

            {config.hasMessage && (
              <div className="space-y-4">
                <textarea
                  value={config.message}
                  onChange={(e) => setConfig({ ...config, message: e.target.value.slice(0, 250) })}
                  placeholder={language === 'nl' 
                    ? 'Schrijf een persoonlijke boodschap die op de achterkant van het boek komt...' 
                    : 'Write a personal message that will appear on the back of the book...'}
                  className="w-full h-32 px-4 py-3 rounded-2xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
                <div className="text-right text-sm text-muted-foreground">
                  {config.message.length}/250
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Format selection & Summary */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {language === 'nl' ? 'Kies je Pakket' : 'Choose your Package'}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {language === 'nl' ? 'Selecteer het formaat van je boek' : 'Select the format of your book'}
              </p>
            </div>

            {/* Format options */}
            <div className="space-y-3">
              {FORMAT_OPTIONS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setConfig({ ...config, format: format.id as BookConfig['format'] })}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                    config.format === format.id
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xl md:text-2xl">{format.emoji}</span>
                      <span className="font-bold text-foreground text-sm md:text-base">
                        {language === 'nl' ? format.labelNl : format.labelEn}
                      </span>
                    </div>
                    <span className="text-primary font-bold text-sm md:text-base">
                      {PRICING.formats[format.id] > 0 ? `+€${PRICING.formats[format.id].toFixed(2)}` : language === 'nl' ? 'Inbegrepen' : 'Included'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 md:p-6 bg-accent/20 rounded-2xl space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {language === 'nl' ? 'Jouw Boek' : 'Your Book'}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">{language === 'nl' ? 'Karakters:' : 'Characters:'}</div>
                <div className="text-foreground font-medium">{config.characterNames.join(', ')}</div>
                <div className="text-muted-foreground">{language === 'nl' ? 'Thema:' : 'Theme:'}</div>
                <div className="text-foreground font-medium">{getThemeDisplay()}</div>
                <div className="text-muted-foreground">{language === 'nl' ? "Pagina's:" : 'Pages:'}</div>
                <div className="text-foreground font-medium">{config.pages}</div>
                <div className="text-muted-foreground">{language === 'nl' ? 'Dier:' : 'Animal:'}</div>
                <div className="text-foreground font-medium">{getAnimalDisplay()}</div>
                <div className="text-muted-foreground">{language === 'nl' ? 'Formaat:' : 'Format:'}</div>
                <div className="text-foreground font-medium">{getFormatDisplay()}</div>
                {config.hasMessage && (
                  <>
                    <div className="text-muted-foreground">{language === 'nl' ? 'Boodschap:' : 'Message:'}</div>
                    <div className="text-foreground font-medium">✓</div>
                  </>
                )}
              </div>
              
              {/* Price breakdown */}
              <div className="pt-3 border-t border-border space-y-1">
                <PriceTag label={language === 'nl' ? 'Basisprijs' : 'Base price'} price={breakdown.base} />
                {breakdown.characters > 0 && (
                  <PriceTag label={language === 'nl' ? 'Extra karakters' : 'Extra characters'} price={breakdown.characters} />
                )}
                {breakdown.pages > 0 && (
                  <PriceTag label={language === 'nl' ? "Extra pagina's" : 'Extra pages'} price={breakdown.pages} />
                )}
                {breakdown.message > 0 && (
                  <PriceTag label={language === 'nl' ? 'Persoonlijke boodschap' : 'Personal message'} price={breakdown.message} />
                )}
                {breakdown.format > 0 && (
                  <PriceTag label={language === 'nl' ? 'Formaat upgrade' : 'Format upgrade'} price={breakdown.format} />
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
                  <span className="font-bold text-foreground">{language === 'nl' ? 'Totaal:' : 'Total:'}</span>
                  <span className="text-xl md:text-2xl font-bold text-primary">€{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Multi-book discount info */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 {language === 'nl' 
                    ? '2 boeken = 10% korting | 3+ boeken = 20% korting op de hele bestelling!' 
                    : '2 books = 10% discount | 3+ books = 20% discount on the entire order!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {language === 'nl' ? 'Vorige' : 'Previous'}
        </Button>

        {step < totalSteps ? (
          <Button
            variant="hero"
            onClick={nextStep}
            disabled={!isStepValid()}
            className="rounded-full"
          >
            {language === 'nl' ? 'Volgende' : 'Next'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button
            variant="hero"
            onClick={handleComplete}
            className="rounded-full"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {language === 'nl' ? 'Voeg toe aan Winkelwagen' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </div>
  );
}
