export interface Book {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  shortDescription: string;
  shortDescriptionEn: string;
  cover: string;
  character: 'bear' | 'rabbit' | 'wolf' | 'child';
  category: string;
  categoryEn: string;
  prices: {
    book: number;
    audiobook: number;
    digital: number;
  };
  pages: number;
  ageRange: string;
  ageRangeEn: string;
  featured: boolean;
  size: string;
  sizeEn: string;
  quality: string;
  qualityEn: string;
  personalization: {
    nl: string[];
    en: string[];
  };
  story: {
    nl: string[];
    en: string[];
  };
  reviews?: {
    rating: number;
    count: number;
    featured?: {
      text: string;
      textEn: string;
      author: string;
    };
  };
}

export const books: Book[] = [
  {
    id: 'teddy-adventure',
    title: 'Teddy\'s Grote Avontuur',
    titleEn: 'Teddy\'s Big Adventure',
    description: 'Volg Teddy de beer op een magische reis door het Betoverde Bos. Samen met zijn vrienden ontdekt hij de kracht van moed en vriendschap.',
    descriptionEn: 'Follow Teddy the bear on a magical journey through the Enchanted Forest. Together with his friends, he discovers the power of courage and friendship.',
    shortDescription: 'Een magisch verhaal over moed en vriendschap. Perfect voor jonge avonturiers die van spannende verhalen houden.',
    shortDescriptionEn: 'A magical story about courage and friendship. Perfect for young adventurers who love exciting stories.',
    cover: '/placeholder.svg',
    character: 'bear',
    category: 'Avontuur & Ontdekking',
    categoryEn: 'Adventure & Discovery',
    prices: {
      book: 14.95,
      audiobook: 9.95,
      digital: 7.95,
    },
    pages: 32,
    ageRange: '3-6 jaar',
    ageRangeEn: '3-6 years',
    size: '21 x 21 cm hardcover met hoogglans afwerking',
    sizeEn: '21 x 21 cm hardcover with gloss finish',
    quality: 'Gedrukt op premium 200gsm papier met duurzame, milieuvriendelijke inkt. Alle boeken worden met de hand gecontroleerd voor kwaliteit.',
    qualityEn: 'Printed on premium 200gsm paper with durable, eco-friendly ink. All books are hand-checked for quality.',
    featured: true,
    personalization: {
      nl: [
        'Kies de naam van het hoofdpersonage die in het verhaal wordt gebruikt',
        'Selecteer het aantal sterren (1-5) dat je kind ziet in de lucht',
        'Kies het favoriete dier van je kind als helper in het verhaal',
        'Personaliseer de illustraties met de haarkleur en huidskleur van je kind'
      ],
      en: [
        'Choose the name of the main character used in the story',
        'Select the number of stars (1-5) that your child sees in the sky',
        'Choose your child\'s favorite animal as a helper in the story',
        'Personalize the illustrations with your child\'s hair and skin color'
      ]
    },
    story: {
      nl: [
        'Teddy de beer woont in het Betoverde Bos, waar magie en avontuur op elk hoekje wachten.',
        'Op een mooie dag besluit Teddy op zoek te gaan naar de Gouden Honing, een legendarische schat die diepe in het bos verborgen ligt.',
        'Onderweg ontmoet hij nieuwe vrienden: een wijze uil, een vrolijk konijn, en een dappere wolf. Samen leren ze dat echte schatten niet altijd van goud zijn.',
        'Dit warme verhaal leert kinderen over het belang van vriendschap, moed, en het geloven in jezelf.'
      ],
      en: [
        'Teddy the bear lives in the Enchanted Forest, where magic and adventure await around every corner.',
        'One beautiful day, Teddy decides to search for the Golden Honey, a legendary treasure hidden deep in the forest.',
        'Along the way, he meets new friends: a wise owl, a cheerful rabbit, and a brave wolf. Together they learn that real treasures are not always made of gold.',
        'This warm story teaches children about the importance of friendship, courage, and believing in yourself.'
      ]
    },
    reviews: {
      rating: 5,
      count: 127,
      featured: {
        text: 'Prachtig boek! Mijn zoon is er helemaal weg van. De personalisatie maakt het extra speciaal.',
        textEn: 'Beautiful book! My son absolutely loves it. The personalization makes it extra special.',
        author: 'Linda'
      }
    }
  },
  {
    id: 'konijn-dromen',
    title: 'Konijn en de Dromenvanger',
    titleEn: 'Rabbit and the Dream Catcher',
    description: 'Kleine Konijn kan niet slapen. Samen met de wijze uil gaat hij op zoek naar de magische dromenvanger die de mooiste dromen brengt.',
    descriptionEn: 'Little Rabbit can\'t sleep. Together with the wise owl, he searches for the magical dream catcher that brings the most beautiful dreams.',
    shortDescription: 'Een rustgevend verhaaltje voor het slapengaan. Helpt kinderen om angsten te overwinnen en rustig in te slapen.',
    shortDescriptionEn: 'A calming bedtime story. Helps children overcome fears and fall asleep peacefully.',
    cover: '/placeholder.svg',
    character: 'rabbit',
    category: 'Bedtijd & Dromen',
    categoryEn: 'Bedtime & Dreams',
    prices: {
      book: 14.95,
      audiobook: 9.95,
      digital: 7.95,
    },
    pages: 28,
    ageRange: '3-5 jaar',
    ageRangeEn: '3-5 years',
    size: '21 x 21 cm hardcover met hoogglans afwerking',
    sizeEn: '21 x 21 cm hardcover with gloss finish',
    quality: 'Gedrukt op premium 200gsm papier met duurzame, milieuvriendelijke inkt. Alle boeken worden met de hand gecontroleerd voor kwaliteit.',
    qualityEn: 'Printed on premium 200gsm paper with durable, eco-friendly ink. All books are hand-checked for quality.',
    featured: true,
    personalization: {
      nl: [
        'Voeg de naam van je kind toe als het hoofdpersonage',
        'Kies de kleur van de dromenvanger',
        'Selecteer het favoriete knuffelbeest dat meegaat op avontuur',
        'Personaliseer de illustraties met kenmerken van je kind'
      ],
      en: [
        'Add your child\'s name as the main character',
        'Choose the color of the dream catcher',
        'Select the favorite stuffed animal that goes on the adventure',
        'Personalize illustrations with your child\'s features'
      ]
    },
    story: {
      nl: [
        'Kleine Konijn ligt in bed maar kan niet slapen. De schaduwen op de muur maken hem bang.',
        'De wijze uil vertelt over de magische dromenvanger die nare dromen wegneemt en mooie dromen brengt.',
        'Samen gaan ze op zoek door het maanverlichte bos, waar ze vriendelijke nachtdieren ontmoeten.',
        'Een troostend verhaal dat kinderen helpt om angsten te overwinnen en rustig in te slapen.'
      ],
      en: [
        'Little Rabbit is in bed but can\'t sleep. The shadows on the wall make him afraid.',
        'The wise owl tells about the magical dream catcher that takes away bad dreams and brings beautiful dreams.',
        'Together they search through the moonlit forest, where they meet friendly night creatures.',
        'A comforting story that helps children overcome fears and fall asleep peacefully.'
      ]
    },
    reviews: {
      rating: 5,
      count: 98,
      featured: {
        text: 'Perfect voor het slapengaan! Onze dochter vraagt er elke avond om.',
        textEn: 'Perfect for bedtime! Our daughter asks for it every night.',
        author: 'Marieke'
      }
    }
  },
  {
    id: 'wolf-vriendschap',
    title: 'De Vriendelijke Wolf',
    titleEn: 'The Friendly Wolf',
    description: 'Wolf voelt zich alleen in het grote bos. Dit warme verhaal leert kinderen dat echte vriendschap op de meest onverwachte plekken te vinden is.',
    descriptionEn: 'Wolf feels alone in the big forest. This warm story teaches children that true friendship can be found in the most unexpected places.',
    shortDescription: 'Een hartverwarmend verhaal over anders zijn en echte vriendschap vinden. Ideaal voor kinderen die naar school gaan.',
    shortDescriptionEn: 'A heartwarming story about being different and finding true friendship. Ideal for children starting school.',
    cover: '/placeholder.svg',
    character: 'wolf',
    category: 'School & Vriendschap',
    categoryEn: 'School & Friendship',
    prices: {
      book: 15.95,
      audiobook: 10.95,
      digital: 8.95,
    },
    pages: 36,
    ageRange: '4-7 jaar',
    ageRangeEn: '4-7 years',
    size: '21 x 21 cm hardcover met hoogglans afwerking',
    sizeEn: '21 x 21 cm hardcover with gloss finish',
    quality: 'Gedrukt op premium 200gsm papier met duurzame, milieuvriendelijke inkt. Alle boeken worden met de hand gecontroleerd voor kwaliteit.',
    qualityEn: 'Printed on premium 200gsm paper with durable, eco-friendly ink. All books are hand-checked for quality.',
    featured: true,
    personalization: {
      nl: [
        'Voeg de naam van je kind toe in het verhaal',
        'Kies de hobby of interesse van je kind (sport, muziek, kunst)',
        'Selecteer klasgenootjes die in het verhaal voorkomen',
        'Personaliseer de schoolscène met herkenbare details'
      ],
      en: [
        'Add your child\'s name to the story',
        'Choose your child\'s hobby or interest (sports, music, art)',
        'Select classmates who appear in the story',
        'Personalize the school scene with recognizable details'
      ]
    },
    story: {
      nl: [
        'Wolf is de nieuwe leerling op school. Hij ziet er anders uit en voelt zich eenzaam.',
        'De andere dieren zijn eerst een beetje bang, maar nieuwsgierig.',
        'Door vriendelijkheid en openheid ontdekt iedereen dat Wolf eigenlijk heel leuk is om mee te spelen.',
        'Een belangrijk verhaal over acceptatie, anders zijn, en vriendschap sluiten op school.'
      ],
      en: [
        'Wolf is the new student at school. He looks different and feels lonely.',
        'The other animals are a bit scared at first, but curious.',
        'Through kindness and openness, everyone discovers that Wolf is actually very fun to play with.',
        'An important story about acceptance, being different, and making friends at school.'
      ]
    },
    reviews: {
      rating: 5,
      count: 143,
      featured: {
        text: 'Heeft mijn zoon enorm geholpen met zijn eerste schooldag. Aanrader!',
        textEn: 'Really helped my son with his first day of school. Highly recommended!',
        author: 'Thomas'
      }
    }
  },
  {
    id: 'emma-sterren',
    title: 'Emma en de Vallende Sterren',
    titleEn: 'Emma and the Falling Stars',
    description: 'Op een heldere nacht ziet Emma een vallende ster. Ze besluit op avontuur te gaan om haar wens waar te maken.',
    descriptionEn: 'On a clear night, Emma sees a falling star. She decides to go on an adventure to make her wish come true.',
    shortDescription: 'Een magisch geboorte verhaal. Perfect cadeau voor nieuwe ouders en een prachtige herinnering aan de geboorte.',
    shortDescriptionEn: 'A magical birth story. Perfect gift for new parents and a beautiful memory of the birth.',
    cover: '/placeholder.svg',
    character: 'child',
    category: 'Geboorte & Baby',
    categoryEn: 'Birth & Baby',
    prices: {
      book: 14.95,
      audiobook: 9.95,
      digital: 7.95,
    },
    pages: 32,
    ageRange: '0-3 jaar',
    ageRangeEn: '0-3 years',
    size: '21 x 21 cm hardcover met hoogglans afwerking',
    sizeEn: '21 x 21 cm hardcover with gloss finish',
    quality: 'Gedrukt op premium 200gsm papier met duurzame, milieuvriendelijke inkt. Alle boeken worden met de hand gecontroleerd voor kwaliteit.',
    qualityEn: 'Printed on premium 200gsm paper with durable, eco-friendly ink. All books are hand-checked for quality.',
    featured: false,
    personalization: {
      nl: [
        'Voeg de naam van de baby toe als hoofdpersonage',
        'Kies de geboortedatum en tijd',
        'Voeg namen van broertjes/zusjes toe',
        'Personaliseer met geboortegewicht en lengte'
      ],
      en: [
        'Add the baby\'s name as the main character',
        'Choose birth date and time',
        'Add names of siblings',
        'Personalize with birth weight and length'
      ]
    },
    story: {
      nl: [
        'Op de nacht dat de baby geboren werd, dansten de sterren in de hemel.',
        'Een vallende ster bracht een speciale wens mee: een prachtige nieuwe baby vol liefde en geluk.',
        'Dit boek vertelt het magische verhaal van de geboorte op een liefdevolle, poëtische manier.',
        'Perfect als cadeau voor nieuwe ouders of als eerste boek voor de baby.'
      ],
      en: [
        'On the night the baby was born, the stars danced in the sky.',
        'A falling star brought a special wish: a beautiful new baby full of love and happiness.',
        'This book tells the magical story of birth in a loving, poetic way.',
        'Perfect as a gift for new parents or as baby\'s first book.'
      ]
    },
    reviews: {
      rating: 5,
      count: 89,
      featured: {
        text: 'Zo\'n mooi kraamcadeau! De ouders waren ontroerd.',
        textEn: 'Such a beautiful baby gift! The parents were moved.',
        author: 'Sophie'
      }
    }
  },
  {
    id: 'beer-honing',
    title: 'Beer Zoekt Honing',
    titleEn: 'Bear Searches for Honey',
    description: 'Kleine Beer heeft honger en gaat op zoek naar de lekkerste honing. Onderweg leert hij delen met zijn vrienden.',
    descriptionEn: 'Little Bear is hungry and goes looking for the most delicious honey. Along the way, he learns to share with his friends.',
    shortDescription: 'Een lief verhaal over delen en samen spelen. Ideaal voor peuters en kleuters.',
    shortDescriptionEn: 'A sweet story about sharing and playing together. Ideal for toddlers.',
    cover: '/placeholder.svg',
    character: 'bear',
    category: 'Leren & Delen',
    categoryEn: 'Learning & Sharing',
    prices: {
      book: 12.95,
      audiobook: 8.95,
      digital: 6.95,
    },
    pages: 24,
    ageRange: '2-4 jaar',
    ageRangeEn: '2-4 years',
    size: '21 x 21 cm hardcover met hoogglans afwerking',
    sizeEn: '21 x 21 cm hardcover with gloss finish',
    quality: 'Gedrukt op premium 200gsm papier met duurzame, milieuvriendelijke inkt. Alle boeken worden met de hand gecontroleerd voor kwaliteit.',
    qualityEn: 'Printed on premium 200gsm paper with durable, eco-friendly ink. All books are hand-checked for quality.',
    featured: false,
    personalization: {
      nl: [
        'Voeg de naam van je peuter toe',
        'Kies het favoriete eten van je kind',
        'Selecteer vriendjes die in het verhaal voorkomen',
        'Personaliseer de illustraties'
      ],
      en: [
        'Add your toddler\'s name',
        'Choose your child\'s favorite food',
        'Select friends who appear in the story',
        'Personalize the illustrations'
      ]
    },
    story: {
      nl: [
        'Kleine Beer is heel erg hongerig en droomt van lekkere honing.',
        'Hij vindt een grote pot honing, maar beseft dat het veel leuker is om te delen.',
        'Beer nodigt al zijn vriendjes uit voor een honing-feestje in het bos.',
        'Een simpel maar krachtig verhaal over het belang van delen en vriendschap.'
      ],
      en: [
        'Little Bear is very hungry and dreams of delicious honey.',
        'He finds a big pot of honey, but realizes it\'s much more fun to share.',
        'Bear invites all his friends to a honey party in the forest.',
        'A simple but powerful story about the importance of sharing and friendship.'
      ]
    },
    reviews: {
      rating: 4.5,
      count: 67,
      featured: {
        text: 'Mijn dochter van 3 vindt het geweldig! Ze leert er echt van.',
        textEn: 'My 3-year-old daughter loves it! She really learns from it.',
        author: 'Anna'
      }
    }
  },
  {
    id: 'konijn-tuin',
    title: 'Konijns Geheime Tuin',
    titleEn: 'Rabbit\'s Secret Garden',
    description: 'Konijn ontdekt een verborgen tuin vol met de mooiste bloemen en de grappigste insecten. Een verhaal over de wonderen van de natuur.',
    descriptionEn: 'Rabbit discovers a hidden garden full of the most beautiful flowers and the funniest insects. A story about the wonders of nature.',
    shortDescription: 'Een ontdekkingsreis door de natuur. Leert kinderen over planten, dieren en de wonderen van de natuur.',
    shortDescriptionEn: 'A discovery journey through nature. Teaches children about plants, animals and the wonders of nature.',
    cover: '/placeholder.svg',
    character: 'rabbit',
    category: 'Natuur & Ontdekking',
    categoryEn: 'Nature & Discovery',
    prices: {
      book: 14.95,
      audiobook: 9.95,
      digital: 7.95,
    },
    pages: 30,
    ageRange: '3-6 jaar',
    ageRangeEn: '3-6 years',
    size: '21 x 21 cm hardcover met hoogglans afwerking',
    sizeEn: '21 x 21 cm hardcover with gloss finish',
    quality: 'Gedrukt op premium 200gsm papier met duurzame, milieuvriendelijke inkt. Alle boeken worden met de hand gecontroleerd voor kwaliteit.',
    qualityEn: 'Printed on premium 200gsm paper with durable, eco-friendly ink. All books are hand-checked for quality.',
    featured: false,
    personalization: {
      nl: [
        'Voeg de naam van je kind toe',
        'Kies het favoriete bloemensoort',
        'Selecteer welke dieren in de tuin verschijnen',
        'Personaliseer de tuin met herkenbare elementen'
      ],
      en: [
        'Add your child\'s name',
        'Choose favorite flower type',
        'Select which animals appear in the garden',
        'Personalize the garden with recognizable elements'
      ]
    },
    story: {
      nl: [
        'Konijn ontdekt een verborgen deurtje achter de struiken in zijn tuin.',
        'Achter de deur ligt een magische tuin vol met prachtige bloemen en vriendelijke insecten.',
        'Elke dag ontdekt Konijn iets nieuws: vlinders, bijen, lieveheersbeestjes en meer.',
        'Een kleurrijk verhaal dat kinderen nieuwsgierig maakt naar de natuur.'
      ],
      en: [
        'Rabbit discovers a hidden door behind the bushes in his garden.',
        'Behind the door lies a magical garden full of beautiful flowers and friendly insects.',
        'Every day Rabbit discovers something new: butterflies, bees, ladybugs and more.',
        'A colorful story that makes children curious about nature.'
      ]
    },
    reviews: {
      rating: 4.5,
      count: 54,
      featured: {
        text: 'Prachtige illustraties! Mijn zoon is gefascineerd door alle details.',
        textEn: 'Beautiful illustrations! My son is fascinated by all the details.',
        author: 'Mark'
      }
    }
  },
];

export const getBookById = (id: string): Book | undefined => {
  return books.find(book => book.id === id);
};

export const getFeaturedBooks = (): Book[] => {
  return books.filter(book => book.featured);
};
