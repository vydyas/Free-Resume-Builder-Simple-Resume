import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review My Resume - Get Professional Feedback on Your Resume | SimpleResu.me",
  description: "Upload your resume and get actionable feedback from reviewers. Share secure links, receive collaborative comments, and improve your resume with our free resume review tool. Support for any PDF format.",
  keywords: [
    "resume review",
    "resume feedback",
    "resume critique",
    "resume sharing",
    "resume collaboration",
    "PDF resume review",
    "professional resume feedback",
    "resume comments",
    "resume improvement",
    "resume sharing tool"
  ],
  openGraph: {
    title: "Review My Resume - Get Professional Feedback | SimpleResu.me",
    description: "Upload your resume and get actionable feedback from reviewers. Share secure links and receive collaborative comments to improve your resume.",
    type: "website",
    url: "https://simpleresu.me/review-my-resume",
  },
  twitter: {
    card: "summary_large_image",
    title: "Review My Resume - Get Professional Feedback | SimpleResu.me",
    description: "Upload your resume and get actionable feedback from reviewers. Share secure links and receive collaborative comments.",
  },
  alternates: {
    canonical: "https://simpleresu.me/review-my-resume",
  },
};

export default function ReviewMyResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


