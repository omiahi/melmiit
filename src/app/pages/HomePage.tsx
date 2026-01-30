import { useNavigate } from 'react-router-dom';
import { FeaturedArticle } from '@/app/components/FeaturedArticle';
import { ArticleCard } from '@/app/components/ArticleCard';
import { ArticleListItem } from '@/app/components/ArticleList';
import { NewArticle } from '@/app/lib/bridge';

interface HomePageProps {
  language: 'en' | 'mn';
  selectedCategory: string | null;
  articles: NewArticle[];
}

export function HomePage({ language, selectedCategory, articles }: HomePageProps) {
  const navigate = useNavigate();

  // Filter articles based on selected category if one is selected
  const filteredArticles = selectedCategory
    ? articles.filter(article => article.categorySlug === selectedCategory)
    : null;

  const handleArticleClick = (id: string) => {
    navigate(`/article/${id}`);
  };

  // If no category is selected, use a fixed layout
  const featuredArticle = articles[0];
  const mainArticles = articles.slice(1, 3);
  const sidebarArticles = articles.slice(3, 8);
  const secondaryArticles = articles.slice(8);

  return (
    <>
      {/* Show filtered articles if a category is selected */}
      {filteredArticles ? (
        <div>
          <div className="mb-8">
            <h2 className="text-white text-3xl font-serif">
              {language === 'en' 
                ? `${selectedCategory?.charAt(0).toUpperCase()}${selectedCategory?.slice(1)}` 
                : (filteredArticles[0]?.category.mn || selectedCategory)}
            </h2>
            <p className="text-white/60 mt-2">
              {filteredArticles.length} {language === 'en' ? 'articles' : 'нийтлэл'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                category={article.category[language]}
                title={article.title[language]}
                excerpt={article.excerpt[language]}
                author={article.author[language]}
                time={article.time}
                imageUrl={article.imageUrl}
                size="small"
                onClick={() => handleArticleClick(article.id)}
              />
            ))}
          </div>
        </div>
      ) : articles.length > 0 ? (
        <>
          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-16 pb-16 border-b border-white/10">
              <FeaturedArticle
                category={featuredArticle.category[language]}
                title={featuredArticle.title[language]}
                excerpt={featuredArticle.excerpt[language]}
                author={featuredArticle.author[language]}
                time={featuredArticle.time}
                imageUrl={featuredArticle.imageUrl!}
                onClick={() => handleArticleClick(featuredArticle.id)}
              />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Main Articles */}
            <div className="lg:col-span-2 space-y-12">
              {mainArticles.map((article) => (
                <div key={article.id} className="pb-12 border-b border-white/10 last:border-b-0">
                  <ArticleCard
                    category={article.category[language]}
                    title={article.title[language]}
                    excerpt={article.excerpt[language]}
                    author={article.author[language]}
                    time={article.time}
                    imageUrl={article.imageUrl}
                    size="medium"
                    onClick={() => handleArticleClick(article.id)}
                  />
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="mb-6 pb-4 border-b border-white/20">
                  <h3 className="text-white uppercase tracking-widest text-sm">
                    {language === 'en' ? 'Latest News' : 'Сүүлийн үеийн мэдээ'}
                  </h3>
                </div>
                <div className="space-y-0">
                  {sidebarArticles.map((article) => (
                    <ArticleListItem
                      key={article.id}
                      category={article.category[language]}
                      title={article.title[language]}
                      time={article.time}
                      onClick={() => handleArticleClick(article.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Articles Grid */}
          {secondaryArticles.length > 0 && (
            <div className="border-t border-white/10 pt-16">
              <div className="mb-8">
                <h3 className="text-white uppercase tracking-widest text-sm">
                  {language === 'en' ? 'More Stories' : 'Бусад мэдээ'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {secondaryArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    category={article.category[language]}
                    title={article.title[language]}
                    excerpt={article.excerpt[language]}
                    author={article.author[language]}
                    time={article.time}
                    imageUrl={article.imageUrl}
                    size="medium"
                    onClick={() => handleArticleClick(article.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 text-white/40 font-serif italic text-xl">
           {language === 'en' ? 'No articles found.' : 'Нийтлэл олдсонгүй.'}
        </div>
      )}
    </>
  );
}
