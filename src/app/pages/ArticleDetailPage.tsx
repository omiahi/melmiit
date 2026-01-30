import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { NewArticle } from '@/app/lib/bridge';

interface ArticleDetailPageProps {
  language: 'en' | 'mn';
  articles: NewArticle[];
}

export function ArticleDetailPage({ language, articles }: ArticleDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const article = articles.find(a => a.id === id);

  // Comments would normally be fetched from an API too, 
  // but for now we'll just show an empty state or placeholder logic
  const comments: any[] = [];

  if (!article) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-3xl font-serif mb-4">
            {language === 'en' ? 'Article Not Found' : 'Нийтлэл олдсонгүй'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors"
          >
            {language === 'en' ? 'Return to Home' : 'Нүүр хуудас руу буцах'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'en' ? 'Back' : 'Буцах'}</span>
        </button>

        {/* Article */}
        <article className="mb-16">
          {/* Category */}
          <div className="text-white/60 text-xs tracking-widest uppercase mb-4">
            {article.category[language]}
          </div>

          {/* Title */}
          <h1 className="text-white text-5xl font-serif leading-tight mb-6">
            {article.title[language]}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-white/50 text-sm mb-8 pb-8 border-b border-white/10">
            <span className="text-white/80">{article.author[language]}</span>
            <span>•</span>
            <span>{article.time}</span>
          </div>

          {/* Image */}
          {article.imageUrl && (
            <div className="mb-8">
              <ImageWithFallback
                src={article.imageUrl}
                alt={article.title[language]}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Excerpt */}
          <div className="text-white/90 text-xl leading-relaxed mb-8 font-serif italic border-l-2 border-white/20 pl-6">
            {article.excerpt[language]}
          </div>

          {/* Full content */}
          {article.fullContent ? (
            <div className="text-white/80 text-lg leading-relaxed space-y-6">
              {article.fullContent[language].split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-lg leading-relaxed italic">
              {language === 'en' 
                ? 'Full article content coming soon...' 
                : 'Бүрэн нийтлэл удахгүй нийтлэгдэнэ...'}
            </div>
          )}
        </article>

        {/* Comments Section */}
        <section className="border-t border-white/10 pt-12">
          <div className="mb-8">
            <h2 className="text-white text-2xl font-serif mb-2">
              {language === 'en' ? 'Top Opinions' : 'Шилдэг санал'}
            </h2>
            <p className="text-white/60">
              {comments.length} {language === 'en' ? 'comments' : 'сэтгэгдэл'}
            </p>
          </div>

          {/* Comment Form */}
          <div className="mb-12 pb-8 border-b border-white/10">
            <textarea
              placeholder={language === 'en' ? 'Share your thoughts...' : 'Саналаа бичнэ үү...'}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <button className="bg-white text-black px-6 py-2 text-sm font-medium hover:bg-white/90 transition-colors">
                {language === 'en' ? 'Post Comment' : 'Илгээх'}
              </button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-8">
              {comments.map((comment) => (
                <div key={comment.id} className="pb-8 border-b border-white/10 last:border-b-0">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {comment.author[language].charAt(0)}
                      </span>
                    </div>

                    {/* Comment content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">{comment.author[language]}</span>
                        <span className="text-white/40 text-sm">•</span>
                        <span className="text-white/40 text-sm">{comment.time}</span>
                      </div>

                      <p className="text-white/80 leading-relaxed mb-4">
                        {comment.content[language]}
                      </p>

                      {/* Comment actions */}
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                          <ThumbsUp className="w-4 h-4 group-hover:fill-white transition-all" />
                          <span className="text-sm">{comment.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{comment.replies} {language === 'en' ? 'replies' : 'хариулт'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              {language === 'en' 
                ? 'No comments yet. Be the first to share your thoughts!' 
                : 'Одоогоор сэтгэгдэл байхгүй байна. Эхний саналаа хуваалц!'}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}