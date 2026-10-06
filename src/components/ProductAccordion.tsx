import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Book } from '@/data/books';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductAccordionProps {
  book: Book;
}

export function ProductAccordion({ book }: ProductAccordionProps) {
  const { language } = useLanguage();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personalization: false,
    story: false,
    sizeQuality: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const accordionSections = [
    {
      key: 'personalization',
      title: language === 'nl' ? 'Hoe wordt het boek gepersonaliseerd?' : 'How is the book personalized?',
      content: book.personalization[language === 'nl' ? 'nl' : 'en']
    },
    {
      key: 'story',
      title: language === 'nl' ? 'Wat is het verhaal?' : 'What\'s the story?',
      content: book.story[language === 'nl' ? 'nl' : 'en']
    },
    {
      key: 'sizeQuality',
      title: language === 'nl' ? 'Formaat & Kwaliteit' : 'Size & Quality',
      content: [
        language === 'nl' ? `📏 Formaat: ${book.size}` : `📏 Size: ${book.sizeEn}`,
        language === 'nl' ? `📄 Pagina's: ${book.pages}` : `📄 Pages: ${book.pages}`,
        language === 'nl' ? `✨ Kwaliteit: ${book.quality}` : `✨ Quality: ${book.qualityEn}`
      ]
    }
  ];

  return (
    <div className="space-y-3">
      {accordionSections.map((section) => (
        <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection(section.key)}
            className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-semibold text-left">{section.title}</h3>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                openSections[section.key] ? 'transform rotate-180' : ''
              }`}
            />
          </button>
          
          {openSections[section.key] && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <ul className="space-y-3">
                {section.content.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1 text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


