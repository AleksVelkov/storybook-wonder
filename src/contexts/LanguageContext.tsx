import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'nl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  nl: {
    // Navigation
    'nav.home': 'Home',
    'nav.shop': 'Maak je Boek',
    'nav.about': 'Over Ons',
    'nav.contact': 'Contact',
    'nav.cart': 'Winkelwagen',
    
    // Hero
    'hero.title': 'Jouw Kind, De Ster van Het Verhaal',
    'hero.subtitle': 'Creëer een uniek, gepersonaliseerd kinderboek met jouw kind als hoofdpersonage. Kies het thema, de karakters en maak het magisch!',
    'hero.cta': 'Begin met Creëren',
    'hero.secondary': 'Hoe het Werkt',
    
    // Featured / Create section
    'create.title': 'Maak Jouw Verhaal',
    'create.subtitle': 'In een paar simpele stappen creëer je een uniek boek',
    
    // How it works
    'how.title': 'Hoe Werkt Het?',
    'how.step1.title': 'Kies Karakters',
    'how.step1.desc': 'Hoeveel kinderen worden de sterren van het verhaal? Kies 1, 2, 3 of meer!',
    'how.step2.title': 'Kies een Thema',
    'how.step2.desc': 'Avontuur, vriendschap, magie of natuur? Jij bepaalt de sfeer van het verhaal.',
    'how.step3.title': 'Personaliseer',
    'how.step3.desc': 'Voeg een persoonlijke boodschap toe en kies het lievelingsdier!',
    
    // Wizard
    'wizard.characters.title': 'Hoeveel Karakters?',
    'wizard.characters.subtitle': 'Kies hoeveel kinderen de hoofdrol krijgen in het verhaal',
    'wizard.theme.title': 'Kies een Thema',
    'wizard.theme.subtitle': 'Wat voor soort avontuur mag het worden?',
    'wizard.pages.title': "Hoeveel Pagina's?",
    'wizard.pages.subtitle': 'Hoe lang wordt het verhaal?',
    'wizard.animal.title': 'Kies een Dier',
    'wizard.animal.subtitle': 'Welk dier wordt de magische vriend in het verhaal?',
    'wizard.message.title': 'Persoonlijke Boodschap',
    'wizard.message.subtitle': 'Deze tekst komt op de achterkant van het boek te staan',
    
    // About
    'about.title': 'Over Ons',
    'about.subtitle': 'De magie achter Sterren Verhalen',
    'about.story.title': 'Ons Verhaal',
    'about.story.text': 'Wij geloven dat elk kind een ster is in hun eigen verhaal. Onze gepersonaliseerde boeken maken van jouw kind de hoofdpersoon van een uniek avontuur.',
    'about.mission.title': 'Onze Missie',
    'about.mission.text': 'Met liefde geïllustreerde karakters en verhalen op maat gemaakt voor elk kind. Elk boek is uniek, net als jouw kleine ster.',
    
    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': 'We horen graag van je!',
    'contact.name': 'Je Naam',
    'contact.email': 'E-mailadres',
    'contact.message': 'Je Bericht',
    'contact.send': 'Verstuur Bericht',
    'contact.success': 'Bedankt! We nemen snel contact met je op.',
    
    // Cart
    'cart.title': 'Winkelwagen',
    'cart.empty': 'Je winkelwagen is leeg',
    'cart.total': 'Totaal',
    'cart.checkout': 'Afrekenen',
    'cart.continue': 'Maak Nog Een Boek',
    'cart.remove': 'Verwijderen',
    
    // Footer
    'footer.tagline': 'Gepersonaliseerde verhalen waarin jouw kind de ster is',
    'footer.links': 'Snelle Links',
    'footer.contact': 'Contact',
    'footer.newsletter': 'Nieuwsbrief',
    'footer.newsletter.placeholder': 'Je e-mailadres',
    'footer.newsletter.button': 'Inschrijven',
    'footer.rights': 'Alle rechten voorbehouden',
    
    // Product
    'product.book': 'Fysiek Boek',
    'product.audiobook': 'Luisterboek',
    'product.digital': 'Digitaal Boek',
    'product.format': 'Kies Je Formaat',
    'product.addToCart': 'Toevoegen aan Winkelwagen',
    'product.personalize': 'Personaliseer dit Boek',
    
    // Personalization
    'personalize.title': 'Maak Het Verhaal Persoonlijk',
    'personalize.childName': 'Naam van het Kind',
    'personalize.childAge': 'Leeftijd',
    'personalize.hobbies': 'Hobby\'s (gescheiden door komma)',
    'personalize.favoriteFood': 'Favoriete Eten',
    'personalize.interestingFact': 'Iets Interessants over {name}',
    'personalize.hobbiesPlaceholder': 'bijv. voetbal, tekenen, dansen',
    'personalize.foodPlaceholder': 'bijv. pizza, spaghetti',
    'personalize.factPlaceholder': 'bijv. Houdt van dinosaurussen',
    
    // Common
    'common.price': 'Prijs',
    'common.from': 'Vanaf',
    'common.loading': 'Laden...',
    'common.error': 'Er ging iets mis',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.shop': 'Create Book',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    
    // Hero
    'hero.title': 'Your Child, The Star of The Story',
    'hero.subtitle': 'Create a unique, personalized children\'s book with your child as the main character. Choose the theme, characters and make it magical!',
    'hero.cta': 'Start Creating',
    'hero.secondary': 'How it Works',
    
    // Featured / Create section
    'create.title': 'Create Your Story',
    'create.subtitle': 'In a few simple steps, create a unique book',
    
    // How it works
    'how.title': 'How Does It Work?',
    'how.step1.title': 'Choose Characters',
    'how.step1.desc': 'How many children will be the stars of the story? Choose 1, 2, 3 or more!',
    'how.step2.title': 'Pick a Theme',
    'how.step2.desc': 'Adventure, friendship, magic or nature? You decide the mood of the story.',
    'how.step3.title': 'Personalize',
    'how.step3.desc': 'Add a personal message and choose the favorite animal!',
    
    // Wizard
    'wizard.characters.title': 'How Many Characters?',
    'wizard.characters.subtitle': 'Choose how many children will star in the story',
    'wizard.theme.title': 'Choose a Theme',
    'wizard.theme.subtitle': 'What kind of adventure should it be?',
    'wizard.pages.title': 'How Many Pages?',
    'wizard.pages.subtitle': 'How long will the story be?',
    'wizard.animal.title': 'Choose an Animal',
    'wizard.animal.subtitle': 'Which animal will be the magical friend in the story?',
    'wizard.message.title': 'Personal Message',
    'wizard.message.subtitle': 'This text will appear on the back of the book',
    
    // About
    'about.title': 'About Us',
    'about.subtitle': 'The magic behind Sterren Verhalen',
    'about.story.title': 'Our Story',
    'about.story.text': 'We believe every child is a star in their own story. Our personalized books make your child the main character of a unique adventure.',
    'about.mission.title': 'Our Mission',
    'about.mission.text': 'With lovingly illustrated characters and stories custom-made for each child. Every book is unique, just like your little star.',
    
    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': 'We\'d love to hear from you!',
    'contact.name': 'Your Name',
    'contact.email': 'Email Address',
    'contact.message': 'Your Message',
    'contact.send': 'Send Message',
    'contact.success': 'Thank you! We\'ll be in touch soon.',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.continue': 'Create Another Book',
    'cart.remove': 'Remove',
    
    // Footer
    'footer.tagline': 'Personalized stories where your child is the star',
    'footer.links': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.newsletter': 'Newsletter',
    'footer.newsletter.placeholder': 'Your email address',
    'footer.newsletter.button': 'Subscribe',
    'footer.rights': 'All rights reserved',
    
    // Product
    'product.book': 'Physical Book',
    'product.audiobook': 'Audiobook',
    'product.digital': 'Digital Book',
    'product.format': 'Choose Your Format',
    'product.addToCart': 'Add to Cart',
    'product.personalize': 'Personalize this Book',
    
    // Personalization
    'personalize.title': 'Make the Story Personal',
    'personalize.childName': 'Child\'s Name',
    'personalize.childAge': 'Age',
    'personalize.hobbies': 'Hobbies (separated by comma)',
    'personalize.favoriteFood': 'Favorite Food',
    'personalize.interestingFact': 'Something Interesting about {name}',
    'personalize.hobbiesPlaceholder': 'e.g. soccer, drawing, dancing',
    'personalize.foodPlaceholder': 'e.g. pizza, spaghetti',
    'personalize.factPlaceholder': 'e.g. Loves dinosaurs',
    
    // Common
    'common.price': 'Price',
    'common.from': 'From',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('nl');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
