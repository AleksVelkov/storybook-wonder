import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CharacterBuilder } from '@/components/CharacterBuilder';
import { CharacterFeatures } from '@/components/CharacterAvatar';
import { ShoppingCart, BookOpen, Headphones, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Book } from '@/data/books';

interface PersonalizationFormProps {
  book: Book;
  bookImage: string;
}

export function PersonalizationForm({ book, bookImage }: PersonalizationFormProps) {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Session storage keys (unique per book)
  const SESSION_KEY = `personalizationProgress_${book.id}`;

  const [selectedFormats, setSelectedFormats] = useState({
    book: true,
    audiobook: false,
    digital: false,
  });

  const [personalization, setPersonalization] = useState({
    childName: '',
    childAge: '',
    hobbies: '',
    favoriteFood: '',
    interestingFact: '',
    personalMessage: '',
  });

  const [characterFeatures, setCharacterFeatures] = useState<CharacterFeatures>({
    gender: 'boy',
    skinTone: 'medium',
    hairColor: 'brown',
    hairStyle: 'short',
    eyeColor: 'brown',
    hasGlasses: false,
  });

  const [pageCount, setPageCount] = useState(book.pages); // Start with book's default pages

  // Load saved progress from sessionStorage on mount
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(SESSION_KEY);
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.selectedFormats) setSelectedFormats(parsed.selectedFormats);
        if (parsed.personalization) setPersonalization(parsed.personalization);
        if (parsed.characterFeatures) setCharacterFeatures(parsed.characterFeatures);
        if (parsed.pageCount) setPageCount(parsed.pageCount);
        
        // Only show notification if there's actual personalization data
        const hasActualData = parsed.personalization?.childName || 
                              parsed.personalization?.childAge ||
                              parsed.characterFeatures?.gender;
        
        if (hasActualData) {
          toast.info(language === 'nl' ? 'Vorige sessie hersteld' : 'Previous session restored', {
            description: language === 'nl' ? 'Je kunt doorgaan waar je gebleven was' : 'You can continue where you left off'
          });
        }
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  }, [book.id]); // Re-run if book changes

  // Save progress to sessionStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        selectedFormats,
        personalization,
        characterFeatures,
        pageCount,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [selectedFormats, personalization, characterFeatures, pageCount, SESSION_KEY]);

  // Clear session storage
  const clearSession = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      
      // Reset to initial state
      setSelectedFormats({
        book: true,
        audiobook: false,
        digital: false,
      });
      setPersonalization({
        childName: '',
        childAge: '',
        hobbies: '',
        favoriteFood: '',
        interestingFact: '',
        personalMessage: '',
      });
      setCharacterFeatures({
        gender: 'boy',
        skinTone: 'medium',
        hairColor: 'brown',
        hairStyle: 'short',
        eyeColor: 'brown',
        hasGlasses: false,
      });
      setPageCount(book.pages);
      
      toast.success(language === 'nl' ? 'Opnieuw beginnen' : 'Starting fresh');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Unified pricing structure (matching custom books)
  const PRICING = {
    basePrice: 24.95,
    pagePrice: 0.75, // per page above 8
    messagePrice: 2.50,
    formats: {
      book_only: 0,
      book_audio: 8.95,
      book_digital: 4.95,
      book_audio_digital: 11.95,
    }
  };

  const totalPrice = (() => {
    let total = PRICING.basePrice;
    
    // Add page costs (pages above 8)
    const extraPages = Math.max(0, pageCount - 8);
    total += extraPages * PRICING.pagePrice;
    
    // Add message cost
    if (personalization.personalMessage.trim()) {
      total += PRICING.messagePrice;
    }
    
    // Add format costs
    const hasBook = selectedFormats.book;
    const hasAudio = selectedFormats.audiobook;
    const hasDigital = selectedFormats.digital;
    
    if (hasBook && hasAudio && hasDigital) {
      total += PRICING.formats.book_audio_digital;
    } else if (hasBook && hasAudio) {
      total += PRICING.formats.book_audio;
    } else if (hasBook && hasDigital) {
      total += PRICING.formats.book_digital;
    } else if (hasBook) {
      total += PRICING.formats.book_only;
    }
    
    return total;
  })();

  const hasSelection = selectedFormats.book || selectedFormats.audiobook || selectedFormats.digital;

  const formatOptions = [
    {
      key: 'book' as const,
      icon: BookOpen,
      label: t('product.book'),
      price: PRICING.basePrice,
      emoji: '📚',
      description: language === 'nl' ? 'Fysiek boek' : 'Physical book',
    },
    {
      key: 'audiobook' as const,
      icon: Headphones,
      label: t('product.audiobook'),
      price: PRICING.formats.book_audio,
      emoji: '🎧',
      description: language === 'nl' ? '+ Luisterboek' : '+ Audiobook',
    },
    {
      key: 'digital' as const,
      icon: FileText,
      label: t('product.digital'),
      price: PRICING.formats.book_digital,
      emoji: '📱',
      description: language === 'nl' ? '+ Digitaal' : '+ Digital',
    },
  ];

  const handleAddToCart = () => {
    if (!hasSelection) {
      toast.error(language === 'nl' ? 'Kies minimaal één formaat' : 'Please select at least one format');
      return;
    }

    if (!personalization.childName.trim()) {
      toast.error(language === 'nl' ? 'Vul de naam van het kind in' : 'Please enter the child\'s name');
      return;
    }

    if (!personalization.childAge.trim()) {
      toast.error(language === 'nl' ? 'Vul de leeftijd in' : 'Please enter the age');
      return;
    }

    const title = language === 'nl' ? book.title : book.titleEn;

    addItem({
      id: book.id,
      title: title,
      titleEn: book.titleEn,
      image: bookImage,
      formats: { ...selectedFormats },
      price: totalPrice,
      personalization: { 
        ...personalization,
        character: characterFeatures,
        pageCount,
      },
    });

    // Clear session storage after successful addition
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }

    toast.success(
      language === 'nl' ? 'Toegevoegd aan winkelwagen!' : 'Added to cart!',
      {
        description: `${title} - ${language === 'nl' ? 'Voor' : 'For'} ${personalization.childName}`,
        action: {
          label: language === 'nl' ? 'Bekijk' : 'View',
          onClick: () => navigate('/cart'),
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Start Fresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          {language === 'nl' ? 'Personaliseer je boek' : 'Personalize your book'}
        </h2>
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

      {/* Step 1: Child's Identity - Name & Appearance */}
      <div className="bg-gradient-to-br from-primary/5 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-primary/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-3">
            <span className="text-sm font-bold">
              {language === 'nl' ? 'STAP 1' : 'STEP 1'}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            ✨ {language === 'nl' ? 'Wie is de Ster van het Verhaal?' : 'Who is the Star of the Story?'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'nl' 
              ? 'Vertel ons over je kind en hoe ze eruitzien - dit is verplicht!' 
              : 'Tell us about your child and what they look like - this is required!'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Basic Info */}
          <div className="space-y-4">
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-primary/20">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                📝 {language === 'nl' ? 'Basis Informatie' : 'Basic Information'}
              </h4>
              
              {/* Child Name */}
              <div className="mb-4">
                <Label htmlFor="childName" className="text-base font-semibold mb-2 block">
                  {t('personalize.childName')} *
                </Label>
                <Input
                  id="childName"
                  value={personalization.childName}
                  onChange={(e) => setPersonalization({ ...personalization, childName: e.target.value })}
                  placeholder={language === 'nl' ? 'bijv. Emma' : 'e.g. Emma'}
                  className="text-lg"
                  required
                />
              </div>

              {/* Child Age */}
              <div>
                <Label htmlFor="childAge" className="text-base font-semibold mb-2 block">
                  {t('personalize.childAge')} *
                </Label>
                <Input
                  id="childAge"
                  type="number"
                  min="0"
                  max="18"
                  value={personalization.childAge}
                  onChange={(e) => setPersonalization({ ...personalization, childAge: e.target.value })}
                  placeholder="5"
                  className="text-lg"
                  required
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-medium text-yellow-900 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>
                  {language === 'nl'
                    ? 'Naam, leeftijd en uiterlijk zijn verplicht om je boek te personaliseren!'
                    : 'Name, age and appearance are required to personalize your book!'}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Character Builder */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200 p-4">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              👤 {language === 'nl' ? 'Hoe Ziet Je Kind Eruit?' : 'What Does Your Child Look Like?'}
            </h4>
            <CharacterBuilder onCharacterChange={setCharacterFeatures} />
          </div>
        </div>
      </div>

      {/* Step 2: Additional Details (Optional) */}
      <div className="bg-gradient-to-br from-accent/5 to-secondary/5 rounded-2xl p-6 border-2 border-accent/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full mb-3">
            <span className="text-sm font-bold">
              {language === 'nl' ? 'STAP 2 (Optioneel)' : 'STEP 2 (Optional)'}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            🌟 {language === 'nl' ? 'Maak het Verhaal Extra Speciaal' : 'Make the Story Extra Special'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'nl' 
              ? 'Voeg extra details toe om het verhaal nog persoonlijker te maken' 
              : 'Add extra details to make the story even more personal'}
          </p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Hobbies */}
          <div>
            <Label htmlFor="hobbies" className="text-base font-semibold mb-2 block">
              {t('personalize.hobbies')}
            </Label>
            <Input
              id="hobbies"
              value={personalization.hobbies}
              onChange={(e) => setPersonalization({ ...personalization, hobbies: e.target.value })}
              placeholder={t('personalize.hobbiesPlaceholder')}
              className="text-lg"
            />
          </div>

          {/* Favorite Food */}
          <div>
            <Label htmlFor="favoriteFood" className="text-base font-semibold mb-2 block">
              {t('personalize.favoriteFood')}
            </Label>
            <Input
              id="favoriteFood"
              value={personalization.favoriteFood}
              onChange={(e) => setPersonalization({ ...personalization, favoriteFood: e.target.value })}
              placeholder={t('personalize.foodPlaceholder')}
              className="text-lg"
            />
          </div>

          {/* Interesting Fact */}
          <div>
            <Label htmlFor="interestingFact" className="text-base font-semibold mb-2 block">
              {t('personalize.interestingFact').replace('{name}', personalization.childName || (language === 'nl' ? 'het kind' : 'the child'))}
            </Label>
            <Textarea
              id="interestingFact"
              value={personalization.interestingFact}
              onChange={(e) => setPersonalization({ ...personalization, interestingFact: e.target.value })}
              placeholder={t('personalize.factPlaceholder')}
              className="text-lg min-h-[80px]"
              rows={3}
            />
          </div>
          {/* Personal Message */}
          <div>
            <Label htmlFor="personalMessage" className="text-base font-semibold mb-2 block">
              💌 {language === 'nl' ? 'Persoonlijk Bericht' : 'Personal Message'}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (+€{PRICING.messagePrice.toFixed(2)})
              </span>
            </Label>
            <Textarea
              id="personalMessage"
              value={personalization.personalMessage}
              onChange={(e) => setPersonalization({ ...personalization, personalMessage: e.target.value })}
              placeholder={language === 'nl' ? 'bijv. Voor mijn lieve Emma, veel leesplezier!' : 'e.g. For my dear Emma, enjoy reading!'}
              className="text-lg min-h-[100px]"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'nl' 
                ? 'Een speciaal bericht dat op de eerste pagina komt' 
                : 'A special message that appears on the first page'}
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Page Count */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-700 px-4 py-2 rounded-full mb-3">
            <span className="text-sm font-bold">
              {language === 'nl' ? 'STAP 3' : 'STEP 3'}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">
            📖 {language === 'nl' ? 'Hoeveel Pagina\'s?' : 'How Many Pages?'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'nl' 
              ? 'Kies de lengte van het verhaal (8-40 pagina\'s)' 
              : 'Choose the length of the story (8-40 pages)'}
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setPageCount(Math.max(8, pageCount - 2))}
              disabled={pageCount <= 8}
            >
              −
            </Button>
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-primary">{pageCount}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'nl' ? 'pagina\'s' : 'pages'}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setPageCount(Math.min(40, pageCount + 2))}
              disabled={pageCount >= 40}
            >
              +
            </Button>
          </div>

          {pageCount > 8 && (
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">
                {language === 'nl' ? 'Extra pagina\'s:' : 'Extra pages:'} {pageCount - 8} × €{PRICING.pagePrice.toFixed(2)} = 
                <span className="font-bold text-primary ml-1">
                  €{((pageCount - 8) * PRICING.pagePrice).toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Format Selection */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-700 px-4 py-2 rounded-full mb-3">
            <span className="text-sm font-bold">
              {language === 'nl' ? 'STAP 4' : 'STEP 4'}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">{t('product.format')}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'nl' 
              ? 'Kies in welk formaat je het verhaal wilt ontvangen' 
              : 'Choose which format you want to receive the story in'}
          </p>
        </div>
        <div className="space-y-3 max-w-2xl mx-auto">
          {formatOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedFormats[option.key]
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedFormats[option.key]}
                  onCheckedChange={(checked) =>
                    setSelectedFormats(prev => ({
                      ...prev,
                      [option.key]: checked as boolean
                    }))
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
              </div>
              <span className="font-bold text-lg">€{option.price.toFixed(2)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Total and Add to Cart */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">
              {language === 'nl' ? '🎉 Klaar om te Bestellen?' : '🎉 Ready to Order?'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {language === 'nl' 
                ? 'Je gepersonaliseerde boek is bijna klaar!' 
                : 'Your personalized book is almost ready!'}
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-xl p-4 border border-green-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{language === 'nl' ? 'Basisprijs' : 'Base price'}</span>
              <span>€{PRICING.basePrice.toFixed(2)}</span>
            </div>
            {pageCount > 8 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{language === 'nl' ? 'Extra pagina\'s' : 'Extra pages'} ({pageCount - 8})</span>
                <span>€{((pageCount - 8) * PRICING.pagePrice).toFixed(2)}</span>
              </div>
            )}
            {personalization.personalMessage.trim() && (
              <div className="flex justify-between text-muted-foreground">
                <span>{language === 'nl' ? 'Persoonlijk bericht' : 'Personal message'}</span>
                <span>€{PRICING.messagePrice.toFixed(2)}</span>
              </div>
            )}
            {(selectedFormats.audiobook || selectedFormats.digital) && (
              <div className="flex justify-between text-muted-foreground">
                <span>{language === 'nl' ? 'Extra formaten' : 'Extra formats'}</span>
                <span>€{
                  (selectedFormats.book && selectedFormats.audiobook && selectedFormats.digital 
                    ? PRICING.formats.book_audio_digital
                    : selectedFormats.book && selectedFormats.audiobook 
                    ? PRICING.formats.book_audio
                    : selectedFormats.book && selectedFormats.digital 
                    ? PRICING.formats.book_digital
                    : 0).toFixed(2)
                }</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-6 bg-white rounded-xl border-2 border-green-300">
            <span className="text-xl font-semibold">{t('cart.total')}:</span>
            <span className="text-4xl font-bold text-green-600">
              €{totalPrice.toFixed(2)}
            </span>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full text-lg py-6"
            onClick={handleAddToCart}
            disabled={!hasSelection}
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            {t('product.addToCart')}
          </Button>

          {!personalization.childName && (
            <p className="text-center text-sm text-red-600 font-medium">
              ⚠️ {language === 'nl' 
                ? 'Vergeet niet om de naam van je kind in te vullen en het uiterlijk te kiezen!' 
                : 'Don\'t forget to fill in your child\'s name and choose their appearance!'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

