import "./globals.css";
import CustomCursor from '@/components/animations/CustomCursor';
import SmoothScroller from '@/components/animations/SmoothScroller';
import PageTransition from '@/components/animations/PageTransition';

export const metadata = {
  title: "OFS Group India - Admin Portal",
  description: "Secure CMS and Operations Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <CustomCursor />
        <SmoothScroller>
          <PageTransition>
            {children}
          </PageTransition>
        </SmoothScroller>
      </body>
    </html>
  );
}
