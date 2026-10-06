import { Link } from 'react-router-dom';
import { Book } from '@/data/books';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface BookCardProps {
  book: Book;
  index?: number;
}

export function BookCard({ book, index = 0 }: BookCardProps) {
  const { language, t } = useLanguage();
  
  const title = language === 'nl' ? book.title : book.titleEn;
  const minPrice = Math.min(book.prices.book, book.prices.audiobook, book.prices.digital);

  return (
    <Link
      to={`/book/${book.id}`}
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="magical-card overflow-hidden h-full flex flex-col">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4">
          <img
            src={bookImages[book.id] || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Character badge */}
          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            {book.character === 'bear' && '🐻'}
            {book.character === 'rabbit' && '🐰'}
            {book.character === 'wolf' && '🐺'}
            {book.character === 'child' && '👧'}
            <span className="ml-1">{book.ageRange}</span>
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          
          <div className="mt-auto flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {t('common.from')}
            </span>
            <span className="text-xl font-bold text-primary">
              €{minPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
