import { HeroSection, HowItWorksSection, CTASection, Footer } from '@/components/landing';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <HeroSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  );
}
