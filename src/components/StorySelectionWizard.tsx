import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CharacterBuilder } from '@/components/CharacterBuilder';
import { CharacterFeatures } from '@/components/CharacterAvatar';
import { BookOpen, Users, Sparkles, MessageSquare, Package, ChevronRight, ChevronLeft, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { books, Book } from '@/data/books';

// Import book images
import bookTeddy from '@/assets/book-teddy.jpg';
import bookRabbit from '@/assets/book-rabbit.jpg';
import bookWolf from '@/assets/book-wolf.jpg';
import bookEmma from '@/assets/book-emma.jpg';
import bookHoney from '@/assets/book-honey.jpg';
import bookGarden from '@/assets/book-garden.jpg';

const bookImages: Record<string, string> = {
  'teddy-adventure': bookTeddy,
  'konijn-dromen': bookRabbit,
  'wolf-vriendschap': bookWolf,
  'emma-sterren': bookEmma,
  'beer-honing': bookHoney,
  'konijn-tuin': bookGarden,
};

interface StoryConfig {
  selectedBook: Book | null;
  characterName: string;
  characterAge: string;
  characterFeatures: CharacterFeatures;
  hobbies: string;
  favoriteFood: string;
  interestingFact: string;
  pages: number;
  personalMessage: string;
  hasMessage: boolean;
  format: 'book' | 'book_audio' | 'book_digital' | 'book_audio_digital';
}

// Unified pricing (same as custom books)
const PRICING = {
  basePrice: 24.95,
  pagePrice: 0.75, // per page above 8
  messagePrice: 2.50,
  formats: {
    book: 0,
    book_audio: 8.95,
    book_digital: 4.95,
    book_audio_digital: 11.95,
  }
};

const PAGE_OPTIONS = [8, 12, 16, 20, 24, 28, 32];

const FORMAT_OPTIONS = [
  { id: 'book', labelNl: 'Alleen Gedrukt Boek', labelEn: 'Printed Book Only', emoji: '📖', price: 0 },
  { id: 'book_audio', labelNl: 'Gedrukt Boek + Audioboek', labelEn: 'Printed Book + Audiobook', emoji: '📖🎧', price: 8.95 },
  { id: 'book_digital', labelNl: 'Gedrukt Boek + Digitale Versie', labelEn: 'Printed Book + Digital Version', emoji: '📖💻', price: 4.95 },
  { id: 'book_audio_digital', labelNl: 'Complete Bundel (Boek + Audio + Digitaal)', labelEn: 'Complete Bundle (Book + Audio + Digital)', emoji: '📖🎧💻', price: 11.95 },
] as const;

// Session storage keys
const SESSION_STORAGE_KEY = 'storySelectionProgress';
const SESSION_STEP_KEY = 'storySelectionStep';

export function StorySelectionWizard() {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<StoryConfig>({
    selectedBook: null,
    characterName: '',
    characterAge: '',
    characterFeatures: {
      gender: 'boy',
      skinTone: 'medium',
      hairColor: 'brown',
      hairStyle: 'short',
      eyeColor: 'brown',
      hasGlasses: false,
    },
    hobbies: '',
    favoriteFood: '',
    interestingFact: '',
    pages: 16,
    personalMessage: '',
    hasMessage: false,
    format: 'book',
  });

  const totalSteps = 5;

  // Load saved progress
  useEffect(() => {
    try {
      const savedConfig = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const savedStep = sessionStorage.getItem(SESSION_STEP_KEY);
      
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Find the book object from the saved ID
        if (parsedConfig.selectedBookId) {
          parsedConfig.selectedBook = books.find(b => b.id === parsedConfig.selectedBookId) || null;
        }
        setConfig(parsedConfig);
        
        const hasActualProgress = savedStep && parseInt(savedStep) > 1;
        const hasActualData = parsedConfig.characterName || parsedConfig.selectedBook;
        
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
  }, []);

  // Save progress
  useEffect(() => {
    try {
      const configToSave = {
        ...config,
        selectedBookId: config.selectedBook?.id,
        selectedBook: undefined, // Don't save the full book object
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(configToSave));
      sessionStorage.setItem(SESSION_STEP_KEY, step.toString());
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [config, step]);

  // Clear session
  const clearSession = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STEP_KEY);
    setStep(1);
    setConfig({
      selectedBook: null,
      characterName: '',
      characterAge: '',
      characterFeatures: {
        gender: 'boy',
        skinTone: 'medium',
        hairColor: 'brown',
        hairStyle: 'short',
        eyeColor: 'brown',
        hasGlasses: false,
      },
      hobbies: '',
      favoriteFood: '',
      interestingFact: '',
      pages: 16,
      personalMessage: '',
      hasMessage: false,
      format: 'book',
    });
    toast.success(language === 'nl' ? 'Opnieuw beginnen' : 'Starting fresh');
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = PRICING.basePrice;
    const extraPages = Math.max(0, config.pages - 8);
    total += extraPages * PRICING.pagePrice;
    if (config.hasMessage && config.personalMessage.trim()) {
      total += PRICING.messagePrice;
    }
    total += PRICING.formats[config.format];
    return total;
  };

  // Check if step is complete
  const isStepComplete = (stepNum: number) => {
    switch (stepNum) {
      case 1: return config.selectedBook !== null;
      case 2: return config.characterName.trim() !== '' && config.characterAge.trim() !== '';
      case 3: return true; // Optional step
      case 4: return config.pages > 0;
      case 5: return true;
      default: return false;
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!config.selectedBook) return;

    const title = language === 'nl' ? config.selectedBook.title : config.selectedBook.titleEn;
    const total = calculateTotal();

    addItem({
      id: config.selectedBook.id,
      title: title,
      titleEn: config.selectedBook.titleEn,
      image: bookImages[config.selectedBook.id] || '/logo.PNG',
      formats: {
        book: true,
        audiobook: config.format === 'book_audio' || config.format === 'book_audio_digital',
        digital: config.format === 'book_digital' || config.format === 'book_audio_digital'
      },
      price: total,
      personalization: {
        childName: config.characterName,
        childAge: config.characterAge,
        hobbies: config.hobbies,
        favoriteFood: config.favoriteFood,
        interestingFact: config.interestingFact,
        personalMessage: config.personalMessage,
        character: config.characterFeatures,
        pageCount: config.pages,
      },
    });

    // Clear session
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STEP_KEY);

    toast.success(
      language === 'nl' ? '🎉 Toegevoegd aan winkelwagen!' : '🎉 Added to cart!',
      {
        description: `${title} - ${language === 'nl' ? 'Voor' : 'For'} ${config.characterName}`,
        action: {
          label: language === 'nl' ? 'Bekijk' : 'View',
          onClick: () => navigate('/cart'),
        },
      }
    );
  };

  // Step indicators
  const steps = [
    { num: 1, icon: BookOpen, label: language === 'nl' ? 'Verhaal' : 'Story' },
    { num: 2, icon: Users, label: language === 'nl' ? 'Personage' : 'Character' },
    { num: 3, icon: Sparkles, label: language === 'nl' ? 'Details' : 'Details' },
    { num: 4, icon: BookOpen, label: language === 'nl' ? 'Pagina\'s' : 'Pages' },
    { num: 5, icon: Package, label: language === 'nl' ? 'Formaat' : 'Format' },
  ];

  // Price display
  const PriceTag = ({ label, price, highlight = false }: { label: string; price: number; highlight?: boolean }) => (
    <div className={`flex justify-between text-sm ${highlight ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
      <span>{label}</span>
      <span>€{price.toFixed(2)}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            {language === 'nl' ? '📚 Kies Je Verhaal' : '📚 Choose Your Story'}
          </h2>
          <Button variant="outline" size="sm" onClick={clearSession}>
            <Trash2 className="w-4 h-4 mr-1" />
            {language === 'nl' ? 'Opnieuw' : 'Start Over'}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {language === 'nl' 
            ? 'Selecteer een bestaand verhaal en personaliseer het voor jouw kind'
            : 'Select an existing story and personalize it for your child'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8 overflow-x-auto pb-2">
        {steps.map((s, index) => (
          <div key={s.num} className="flex items-center min-w-0">
            <div className={`flex flex-col items-center ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step > s.num ? 'bg-primary border-primary text-white' :
                step === s.num ? 'border-primary bg-primary/10' : 'border-muted'
              }`}>
                {step > s.num ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className="text-xs mt-1 truncate max-w-[60px] text-center">{s.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 mx-1 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-gradient-to-br from-accent/30 to-background rounded-3xl p-6 md:p-8 border-2 border-primary/20 min-h-[400px]">
        
        {/* Step 1: Story Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                {language === 'nl' ? '📖 Welk Verhaal Spreekt Je Aan?' : '📖 Which Story Speaks to You?'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'nl' ? 'Klik op een verhaal om te selecteren' : 'Click on a story to select'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => {
                const title = language === 'nl' ? book.title : book.titleEn;
                const description = language === 'nl' ? book.shortDescription : book.shortDescriptionEn;
                const isSelected = config.selectedBook?.id === book.id;
                
                return (
                  <button
                    key={book.id}
                    onClick={() => setConfig({ ...config, selectedBook: book, pages: book.pages })}
                    className={`text-left p-4 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      isSelected 
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                        : 'border-border hover:border-primary/50 bg-white'
                    }`}
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3">
                      <img 
                        src={bookImages[book.id] || '/logo.PNG'} 
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-sm mb-1 line-clamp-1">{title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs bg-accent/50 px-2 py-1 rounded-full">
                        {language === 'nl' ? book.category : book.categoryEn}
                      </span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Character Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                ✨ {language === 'nl' ? 'Wie is de Ster van het Verhaal?' : 'Who is the Star of the Story?'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'nl' ? 'Vertel ons over het kind' : 'Tell us about the child'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4 bg-white/80 rounded-xl p-4 border">
                <h4 className="font-semibold flex items-center gap-2">
                  📝 {language === 'nl' ? 'Basis Informatie' : 'Basic Information'}
                </h4>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'nl' ? 'Naam van het kind' : 'Child\'s name'} *
                  </label>
                  <Input
                    value={config.characterName}
                    onChange={(e) => setConfig({ ...config, characterName: e.target.value })}
                    placeholder={language === 'nl' ? 'bijv. Emma' : 'e.g. Emma'}
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'nl' ? 'Leeftijd' : 'Age'} *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="18"
                    value={config.characterAge}
                    onChange={(e) => setConfig({ ...config, characterAge: e.target.value })}
                    placeholder="5"
                    className="text-lg"
                  />
                </div>
              </div>

              {/* Character Appearance */}
              <div className="bg-white/80 rounded-xl p-4 border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  👤 {language === 'nl' ? 'Uiterlijk' : 'Appearance'}
                </h4>
                <CharacterBuilder
                  features={config.characterFeatures}
                  onChange={(features) => setConfig({ ...config, characterFeatures: features })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Extra Details (Optional) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                🌟 {language === 'nl' ? 'Maak het Extra Speciaal' : 'Make it Extra Special'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'nl' ? 'Optioneel: voeg extra details toe' : 'Optional: add extra details'}
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  🎨 {language === 'nl' ? 'Hobby\'s' : 'Hobbies'}
                </label>
                <Input
                  value={config.hobbies}
                  onChange={(e) => setConfig({ ...config, hobbies: e.target.value })}
                  placeholder={language === 'nl' ? 'bijv. voetbal, tekenen' : 'e.g. soccer, drawing'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  🍕 {language === 'nl' ? 'Favoriete Eten' : 'Favorite Food'}
                </label>
                <Input
                  value={config.favoriteFood}
                  onChange={(e) => setConfig({ ...config, favoriteFood: e.target.value })}
                  placeholder={language === 'nl' ? 'bijv. pizza, pannenkoeken' : 'e.g. pizza, pancakes'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  💡 {language === 'nl' ? 'Interessant Feit' : 'Interesting Fact'}
                </label>
                <Textarea
                  value={config.interestingFact}
                  onChange={(e) => setConfig({ ...config, interestingFact: e.target.value })}
                  placeholder={language === 'nl' ? 'bijv. Houdt van dinosaurussen' : 'e.g. Loves dinosaurs'}
                  rows={2}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="hasMessage"
                    checked={config.hasMessage}
                    onChange={(e) => setConfig({ ...config, hasMessage: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="hasMessage" className="font-medium">
                    💌 {language === 'nl' ? 'Persoonlijk Bericht Toevoegen' : 'Add Personal Message'}
                    <span className="text-sm text-muted-foreground ml-2">(+€{PRICING.messagePrice.toFixed(2)})</span>
                  </label>
                </div>
                
                {config.hasMessage && (
                  <Textarea
                    value={config.personalMessage}
                    onChange={(e) => setConfig({ ...config, personalMessage: e.target.value })}
                    placeholder={language === 'nl' ? 'bijv. Voor mijn lieve Emma, veel leesplezier!' : 'e.g. For my dear Emma, enjoy reading!'}
                    rows={3}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Page Count */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                📖 {language === 'nl' ? 'Hoeveel Pagina\'s?' : 'How Many Pages?'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'nl' ? 'Kies de lengte van het verhaal' : 'Choose the length of the story'}
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {PAGE_OPTIONS.map((pages) => (
                  <button
                    key={pages}
                    onClick={() => setConfig({ ...config, pages })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      config.pages === pages
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary/50 bg-white'
                    }`}
                  >
                    <div className="text-lg font-bold">{pages}</div>
                    <div className="text-xs">{language === 'nl' ? 'pag.' : 'pg.'}</div>
                  </button>
                ))}
              </div>

              {config.pages > 8 && (
                <div className="mt-4 p-3 bg-accent/30 rounded-lg text-center">
                  <p className="text-sm">
                    {language === 'nl' ? 'Extra pagina\'s:' : 'Extra pages:'} {config.pages - 8} × €{PRICING.pagePrice.toFixed(2)} = 
                    <span className="font-bold text-primary ml-1">
                      €{((config.pages - 8) * PRICING.pagePrice).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Format Selection */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                📦 {language === 'nl' ? 'Kies Je Formaat' : 'Choose Your Format'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'nl' ? 'Hoe wil je het verhaal ontvangen?' : 'How would you like to receive the story?'}
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-3">
              {FORMAT_OPTIONS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setConfig({ ...config, format: format.id as StoryConfig['format'] })}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    config.format === format.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{format.emoji}</span>
                    <span className="font-medium text-left">
                      {language === 'nl' ? format.labelNl : format.labelEn}
                    </span>
                  </div>
                  <span className="font-bold">
                    {format.price > 0 ? `+€${format.price.toFixed(2)}` : language === 'nl' ? 'Inclusief' : 'Included'}
                  </span>
                </button>
              ))}
            </div>

            {/* Price Summary */}
            <div className="max-w-xl mx-auto mt-6 p-4 bg-white rounded-xl border-2 border-primary/30">
              <h4 className="font-bold mb-3 text-center">
                {language === 'nl' ? '💰 Prijsoverzicht' : '💰 Price Summary'}
              </h4>
              <div className="space-y-2">
                <PriceTag label={language === 'nl' ? 'Basisprijs' : 'Base price'} price={PRICING.basePrice} />
                {config.pages > 8 && (
                  <PriceTag 
                    label={`${language === 'nl' ? 'Extra pagina\'s' : 'Extra pages'} (${config.pages - 8})`} 
                    price={(config.pages - 8) * PRICING.pagePrice} 
                  />
                )}
                {config.hasMessage && config.personalMessage.trim() && (
                  <PriceTag label={language === 'nl' ? 'Persoonlijk bericht' : 'Personal message'} price={PRICING.messagePrice} />
                )}
                {PRICING.formats[config.format] > 0 && (
                  <PriceTag label={language === 'nl' ? 'Extra formaten' : 'Extra formats'} price={PRICING.formats[config.format]} />
                )}
                <div className="border-t pt-2 mt-2">
                  <PriceTag label={language === 'nl' ? 'Totaal' : 'Total'} price={calculateTotal()} highlight />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 gap-4">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="flex-1 md:flex-none"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {language === 'nl' ? 'Vorige' : 'Previous'}
        </Button>

        {step < totalSteps ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!isStepComplete(step)}
            className="flex-1 md:flex-none"
          >
            {language === 'nl' ? 'Volgende' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            variant="hero"
            onClick={handleAddToCart}
            disabled={!config.characterName.trim() || !config.selectedBook}
            className="flex-1 md:flex-none"
          >
            <Check className="w-4 h-4 mr-1" />
            {language === 'nl' ? 'Toevoegen aan Winkelwagen' : 'Add to Cart'} - €{calculateTotal().toFixed(2)}
          </Button>
        )}
      </div>
    </div>
  );
}


