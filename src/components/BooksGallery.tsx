import { useState } from 'react';
import { books, Book } from '@/data/books';
import { BookCard } from '@/components/BookCard';
import { useLanguage } from '@/contexts/LanguageContext';

export function BooksGallery() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...new Set(books.map(book => language === 'nl' ? book.category : book.categoryEn))];

  // Filter books by category
  const filteredBooks = selectedCategory === 'all'
    ? books
    : books.filter(book => 
        (language === 'nl' ? book.category : book.categoryEn) === selectedCategory
      );

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap gap-2 p-2 bg-muted rounded-2xl">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-transparent text-foreground hover:bg-background'
              }`}
            >
              {category === 'all' 
                ? (language === 'nl' ? 'Alle Boeken' : 'All Books')
                : category
              }
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">
            {language === 'nl' 
              ? 'Geen boeken gevonden in deze categorie' 
              : 'No books found in this category'}
          </p>
        </div>
      )}
    </div>
  );
}


