import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CharacterFeatures } from './CharacterAvatar';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles, Check } from 'lucide-react';

interface CharacterBuilderProps {
  onCharacterChange?: (features: CharacterFeatures) => void;
  initialFeatures?: CharacterFeatures;
}

export function CharacterBuilder({ onCharacterChange, initialFeatures }: CharacterBuilderProps) {
  const { language } = useLanguage();
  const [openSection, setOpenSection] = useState<string>('gender');
  const [features, setFeatures] = useState<CharacterFeatures>(initialFeatures || {
    gender: 'boy',
    skinTone: 'medium',
    hairColor: 'brown',
    hairStyle: 'short',
    eyeColor: 'brown',
    hasGlasses: false,
  });

  const updateFeature = <K extends keyof CharacterFeatures>(key: K, value: CharacterFeatures[K]) => {
    const newFeatures = { ...features, [key]: value };
    setFeatures(newFeatures);
    onCharacterChange?.(newFeatures);
    
    // Auto-advance to next section
    const sections = ['gender', 'skinTone', 'hairColor', 'hairStyle', 'eyeColor', 'glasses'];
    const currentIndex = sections.indexOf(openSection);
    if (currentIndex < sections.length - 1) {
      setOpenSection(sections[currentIndex + 1]);
    }
  };

  const generateRandom = () => {
    const randomGender = Math.random() > 0.5 ? 'boy' : 'girl';
    const skinTones = ['light', 'medium', 'tan', 'olive', 'brown', 'dark'];
    const hairColors = ['blonde', 'brown', 'black', 'red', 'auburn', 'gray'];
    const hairStyles = ['short', 'long', 'curly', 'ponytail'];
    const eyeColors = ['blue', 'green', 'brown', 'hazel', 'gray', 'amber'];
    
    const randomFeatures: CharacterFeatures = {
      gender: randomGender,
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
      hasGlasses: Math.random() > 0.7,
    };
    
    setFeatures(randomFeatures);
    onCharacterChange?.(randomFeatures);
    setOpenSection(''); // Close all sections
  };

  const isComplete = (section: string): boolean => {
    switch (section) {
      case 'gender': return !!features.gender;
      case 'skinTone': return !!features.skinTone;
      case 'hairColor': return !!features.hairColor;
      case 'hairStyle': return !!features.hairStyle;
      case 'eyeColor': return !!features.eyeColor;
      case 'glasses': return true; // Always complete (optional)
      default: return false;
    }
  };

  const genderOptions = [
    { value: 'boy', labelNl: 'Jongen', labelEn: 'Boy', emoji: '👦' },
    { value: 'girl', labelNl: 'Meisje', labelEn: 'Girl', emoji: '👧' }
  ];

  const skinTones = [
    { value: 'light', labelNl: 'Licht', labelEn: 'Light', color: 'bg-[#ffdbb4]' },
    { value: 'medium', labelNl: 'Middelmatig', labelEn: 'Medium', color: 'bg-[#edb98a]' },
    { value: 'tan', labelNl: 'Gebruind', labelEn: 'Tan', color: 'bg-[#d08b5b]' },
    { value: 'olive', labelNl: 'Olijf', labelEn: 'Olive', color: 'bg-[#ae5d29]' },
    { value: 'brown', labelNl: 'Bruin', labelEn: 'Brown', color: 'bg-[#8d5524]' },
    { value: 'dark', labelNl: 'Donker', labelEn: 'Dark', color: 'bg-[#613618]' }
  ];

  const hairColors = [
    { value: 'blonde', labelNl: 'Blond', labelEn: 'Blonde', color: 'bg-[#ffd700]' },
    { value: 'brown', labelNl: 'Bruin', labelEn: 'Brown', color: 'bg-[#724133]' },
    { value: 'black', labelNl: 'Zwart', labelEn: 'Black', color: 'bg-[#2c1b18]' },
    { value: 'red', labelNl: 'Rood', labelEn: 'Red', color: 'bg-[#d55448]' },
    { value: 'auburn', labelNl: 'Kastanje', labelEn: 'Auburn', color: 'bg-[#a55728]' },
    { value: 'gray', labelNl: 'Grijs', labelEn: 'Gray', color: 'bg-[#b7c0c7]' }
  ];

  const hairStyles = [
    { value: 'short', labelNl: 'Kort', labelEn: 'Short', emoji: '✂️' },
    { value: 'long', labelNl: 'Lang', labelEn: 'Long', emoji: '💇' },
    { value: 'curly', labelNl: 'Krullend', labelEn: 'Curly', emoji: '🌀' },
    { value: 'ponytail', labelNl: 'Staart', labelEn: 'Ponytail', emoji: '🎀' }
  ];

  const eyeColors = [
    { value: 'brown', labelNl: 'Bruin', labelEn: 'Brown', color: 'bg-[#7a4e1f]' },
    { value: 'blue', labelNl: 'Blauw', labelEn: 'Blue', color: 'bg-[#5b9bd5]' },
    { value: 'green', labelNl: 'Groen', labelEn: 'Green', color: 'bg-[#70ad47]' },
    { value: 'hazel', labelNl: 'Hazelaar', labelEn: 'Hazel', color: 'bg-[#a57c52]' },
    { value: 'gray', labelNl: 'Grijs', labelEn: 'Gray', color: 'bg-[#a5a5a5]' },
    { value: 'amber', labelNl: 'Amber', labelEn: 'Amber', color: 'bg-[#ff8c00]' }
  ];

  return (
    <div className="space-y-3 overflow-x-hidden w-full">
      {/* Random Generation Button - Compact */}
      <Button 
        onClick={generateRandom}
        variant="outline"
        className="w-full gap-2 text-xs sm:text-sm py-2"
        type="button"
      >
        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
        {language === 'nl' ? 'Verras me! (Willekeurig)' : 'Surprise Me! (Random)'}
      </Button>

      <div className="text-center text-xs sm:text-sm text-muted-foreground py-1">
        {language === 'nl' ? 'Kies hieronder:' : 'Choose below:'}
      </div>

      {/* Accordion Sections - Compact */}
      <Accordion type="single" value={openSection} onValueChange={setOpenSection} collapsible className="space-y-2">
        {/* Gender */}
        <AccordionItem value="gender" className="border rounded-lg px-3">
          <AccordionTrigger className="text-xs sm:text-sm font-semibold py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg">{features.gender === 'boy' ? '👦' : '👧'}</span>
              <span className="text-xs sm:text-sm">{language === 'nl' ? 'Geslacht' : 'Gender'}</span>
              {isComplete('gender') && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-2 gap-2 pt-2 px-1">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFeature('gender', option.value as 'boy' | 'girl')}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-colors flex flex-col items-center justify-center ${
                    features.gender === option.value
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-xl sm:text-2xl mb-1">{option.emoji}</div>
                  <div className="text-[11px] sm:text-xs font-medium truncate w-full text-center">
                    {language === 'nl' ? option.labelNl : option.labelEn}
                  </div>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Skin Tone */}
        <AccordionItem value="skinTone" className="border rounded-lg px-3">
          <AccordionTrigger className="text-xs sm:text-sm font-semibold py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${skinTones.find(s => s.value === features.skinTone)?.color || 'bg-gray-300'} border border-gray-400`}></div>
              <span className="text-xs sm:text-sm">{language === 'nl' ? 'Huidskleur' : 'Skin Tone'}</span>
              {isComplete('skinTone') && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2">
              {skinTones.map((tone) => (
                <button
                  key={tone.value}
                  type="button"
                  onClick={() => updateFeature('skinTone', tone.value)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                    features.skinTone === tone.value
                      ? 'border-primary shadow-md bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${tone.color} border-2 border-gray-300 mx-auto mb-1`}></div>
                  <div className="text-[10px] sm:text-xs font-medium leading-tight">
                    {language === 'nl' ? tone.labelNl : tone.labelEn}
                  </div>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Hair Color */}
        <AccordionItem value="hairColor" className="border rounded-lg px-3">
          <AccordionTrigger className="text-xs sm:text-sm font-semibold py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${hairColors.find(h => h.value === features.hairColor)?.color || 'bg-gray-300'} border border-gray-400`}></div>
              <span className="text-xs sm:text-sm">{language === 'nl' ? 'Haarkleur' : 'Hair Color'}</span>
              {isComplete('hairColor') && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2">
              {hairColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateFeature('hairColor', color.value)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                    features.hairColor === color.value
                      ? 'border-primary shadow-md bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${color.color} border-2 border-gray-300 mx-auto mb-1`}></div>
                  <div className="text-[10px] sm:text-xs font-medium leading-tight">
                    {language === 'nl' ? color.labelNl : color.labelEn}
                  </div>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Hair Style */}
        <AccordionItem value="hairStyle" className="border rounded-lg px-3">
          <AccordionTrigger className="text-xs sm:text-sm font-semibold py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg">{hairStyles.find(s => s.value === features.hairStyle)?.emoji || '✂️'}</span>
              <span className="text-xs sm:text-sm">{language === 'nl' ? 'Haarstijl' : 'Hair Style'}</span>
              {isComplete('hairStyle') && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-2 gap-2 pt-2">
              {hairStyles.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => updateFeature('hairStyle', style.value)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                    features.hairStyle === style.value
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-xl sm:text-2xl mb-1">{style.emoji}</div>
                  <div className="text-xs font-medium">
                    {language === 'nl' ? style.labelNl : style.labelEn}
                  </div>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Eye Color */}
        <AccordionItem value="eyeColor" className="border rounded-lg px-3">
          <AccordionTrigger className="text-xs sm:text-sm font-semibold py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${eyeColors.find(e => e.value === features.eyeColor)?.color || 'bg-gray-300'} border border-gray-400`}></div>
              <span className="text-xs sm:text-sm">{language === 'nl' ? 'Oogkleur' : 'Eye Color'}</span>
              {isComplete('eyeColor') && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2">
              {eyeColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateFeature('eyeColor', color.value)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                    features.eyeColor === color.value
                      ? 'border-primary shadow-md bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${color.color} border-2 border-gray-300 mx-auto mb-1`}></div>
                  <div className="text-[10px] sm:text-xs font-medium leading-tight">
                    {language === 'nl' ? color.labelNl : color.labelEn}
                  </div>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Glasses */}
        <AccordionItem value="glasses" className="border rounded-lg px-3">
          <AccordionTrigger className="text-xs sm:text-sm font-semibold py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg">{features.hasGlasses ? '👓' : '👀'}</span>
              <span className="text-xs sm:text-sm">{language === 'nl' ? 'Bril (optioneel)' : 'Glasses (optional)'}</span>
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-2 gap-2 pt-2 px-1">
              <button
                type="button"
                onClick={() => updateFeature('hasGlasses', false)}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                  !features.hasGlasses
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1">👀</div>
                <div className="text-xs font-medium">
                  {language === 'nl' ? 'Geen bril' : 'No glasses'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => updateFeature('hasGlasses', true)}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                  features.hasGlasses
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1">👓</div>
                <div className="text-xs font-medium">
                  {language === 'nl' ? 'Met bril' : 'With glasses'}
                </div>
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
