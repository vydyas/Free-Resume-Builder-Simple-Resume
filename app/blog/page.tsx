import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { formatDate } from '@/lib/utils';
import { SharedHeader } from '@/components/shared-header';
import { Calendar, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | SimpleResu.me - Resume Tips & Career Advice',
  description: 'Expert tips on creating resumes, career advice, and insights for job seekers. Learn how to create ATS-friendly resumes and land your dream job.',
  keywords: 'resume tips, career advice, ATS resume, job search, resume builder blog',
  openGraph: {
    title: 'Blog | SimpleResu.me',
    description: 'Expert tips on creating resumes, career advice, and insights for job seekers.',
    type: 'website',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader variant="landing" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 md:py-16">
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Blog
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Expert tips and insights to help you create the perfect resume and advance your career.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <p className="text-sm sm:text-base text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-b border-gray-200 pb-8 sm:pb-10 md:pb-12 last:border-0 last:pb-0"
              >
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>
                    {post.readingTime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{post.readingTime} min read</span>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-emerald-600 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}





