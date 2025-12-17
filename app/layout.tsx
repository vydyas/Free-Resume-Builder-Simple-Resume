import { Inter, Great_Vibes } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { StylingProvider } from "@/lib/styling-context";
import { UserSyncProvider } from "@/components/user-sync-provider";
import Script from "next/script";
import { GA_TRACKING_ID } from "@/lib/analytics";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Initialize the Great Vibes font for logo
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="theme-color" content="#ffffff" />
          <title>
            Free Resume Maker | Online Resume Builder | SimpleResu.me
          </title>
          <meta
            name="description"
            content="Create professional resumes for free with SimpleResu.me - the best online resume builder. Build ATS-friendly resumes with modern templates. Free resume maker for builders, thinkers, developers, hackers, and tinkerers."
          />
          <meta
            name="keywords"
            content="free resume maker, online resume builder, resume builder free, create resume online, professional resume builder, ATS resume builder, resume templates, free resume templates, resume maker online, build resume free, simple resume builder, resume creator, free CV maker, online CV builder"
          />
          <meta name="author" content="SimpleResu.me" />
          <meta
            name="robots"
            content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          />
          <link rel="canonical" href="https://simpleresu.me" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover, minimum-scale=1, maximum-scale=5"
          />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://simpleresu.me" />
          <meta
            property="og:title"
            content="Free Resume Maker | Online Resume Builder | SimpleResu.me"
          />
          <meta
            property="og:description"
            content="Create professional resumes for free with SimpleResu.me - the best online resume builder. Build ATS-friendly resumes with modern templates."
          />
          <meta
            property="og:image"
            content="https://simpleresu.me/og-image.png"
          />
          <meta property="og:site_name" content="SimpleResu.me" />
          <meta property="og:locale" content="en_US" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content="https://simpleresu.me" />
          <meta
            name="twitter:title"
            content="Free Resume Maker | Online Resume Builder | SimpleResu.me"
          />
          <meta
            name="twitter:description"
            content="Create professional resumes for free with SimpleResu.me - the best online resume builder. Build ATS-friendly resumes with modern templates."
          />
          <meta
            name="twitter:image"
            content="https://simpleresu.me/og-image.png"
          />

          {/* Structured Data - JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "SimpleResu.me",
                description:
                  "Free online resume builder - Create professional, ATS-friendly resumes with modern templates",
                url: "https://simpleresu.me",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.8",
                  ratingCount: "5000",
                },
                featureList: [
                  "Free Resume Builder",
                  "ATS-Friendly Templates",
                  "Multiple Resume Templates",
                  "PDF Export",
                  "Real-time Preview",
                  "Customizable Sections",
                ],
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "SimpleResu.me",
                url: "https://simpleresu.me",
                logo: "https://simpleresu.me/logo.png",
                sameAs: [
                  "https://www.linkedin.com/in/siddhucse/",
                  "https://github.com/vydyas/Free-Resume-Builder-Simple-Resume",
                ],
              }),
            }}
          />

          {/* Google Analytics - Using Next.js Script component for better loading control */}
          {/* Excludes /admin/* routes from being tracked */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Don't track admin routes
              if (!window.location.pathname.startsWith('/admin')) {
                gtag('config', '${GA_TRACKING_ID}');
              }
            `}
          </Script>
        </head>
        <body className={`${inter.className} ${greatVibes.variable}`}>
          <ThemeProvider>
            <StylingProvider>
              <UserSyncProvider>{children}</UserSyncProvider>
            </StylingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
