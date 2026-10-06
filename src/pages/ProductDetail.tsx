import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBookById } from '@/data/books';
import { ProductAccordion } from '@/components/ProductAccordion';
import { PersonalizationForm } from '@/components/PersonalizationForm';
import { ArrowLeft, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  
  const book = getBookById(id || '');

  const title = book ? (language === 'nl' ? book.title : book.titleEn) : '';
  const description = book ? (language === 'nl' ? book.description : book.descriptionEn) : '';

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('common.error')}</h1>
            <Link to="/shop" className="text-primary hover:underline">
              {t('cart.continue')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} - Droomverhalen</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Back button */}
            <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              {t('cart.continue')}
            </Link>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Book Image */}
              <div className="relative">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-float">
                  <img
                    src={bookImages[book.id] || '/placeholder.svg'}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Character badge */}
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full text-base font-medium shadow-soft">
                  {book.character === 'bear' && '🐻'}
                  {book.character === 'rabbit' && '🐰'}
                  {book.character === 'wolf' && '🐺'}
                  {book.character === 'child' && '👧'}
                  <span className="ml-2">{book.ageRange} {language === 'nl' ? 'jaar' : 'years'}</span>
                </div>
              </div>

              {/* Book Details */}
              <div className="flex flex-col">
                {/* Category Badge */}
                {book.category && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-accent/10 text-accent-foreground text-sm font-medium rounded-full">
                      {language === 'nl' ? book.category : book.categoryEn}
                    </span>
                  </div>
                )}

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {title}
                </h1>

                {/* Reviews */}
                {book.reviews && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(book.reviews!.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {language === 'nl' ? 'Waardering' : 'Rated'} {book.reviews.rating} {language === 'nl' ? 'van de' : 'out of'} 5
                    </span>
                  </div>
                )}
                
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  {language === 'nl' ? book.shortDescription : book.shortDescriptionEn}
                </p>

                {/* Book specs */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <span>🎂</span>
                    <span className="font-medium">
                      {language === 'nl' ? 'Aanbevolen voor' : 'Recommended for'} {language === 'nl' ? book.ageRange : book.ageRangeEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <span>📖</span>
                    <span className="font-medium">{book.pages} {language === 'nl' ? 'pagina\'s' : 'pages'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <span>🚚</span>
                    <span className="font-medium">
                      {language === 'nl' ? 'Verzonden in 2-4 werkdagen' : 'Shipped in 2-4 working days'}
                    </span>
                  </div>
                </div>

                {/* Personalization Form */}
                <PersonalizationForm book={book} bookImage={bookImages[book.id] || '/placeholder.svg'} />
              </div>
            </div>

            {/* Accordion Section */}
            <div className="mt-16 max-w-3xl mx-auto">
              <ProductAccordion book={book} />
            </div>

            {/* Judge.me Reviews Section */}
            <div className="mt-16 max-w-3xl mx-auto">
              {/* Judge.me Review Widget */}
              <div 
                className="jdgm-widget jdgm-review-widget" 
                data-product-title={title}
                data-id={book.id}
              ></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;
