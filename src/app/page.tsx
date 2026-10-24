'use client';

import { useState } from 'react';
import { SoundProvider } from '@/components/sound/SoundManager';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { CursorGlow } from '@/components/cinematic/CursorGlow';
import { IntroSequence } from '@/components/cinematic/IntroSequence';
import { HeroSection } from '@/components/cinematic/HeroSection';
import { AnnouncementPopup } from '@/components/ui/AnnouncementPopup';
import { EventStory } from '@/components/sections/EventStory';
import { EventDashboard } from '@/components/sections/EventDashboard';
import { FAQ } from '@/components/sections/FAQ';
import { Contact } from '@/components/sections/Contact';

export default function HomePage() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <SoundProvider>
      {!introComplete && (
        <IntroSequence onComplete={() => setIntroComplete(true)} />
      )}

      <CursorGlow />
      <AnnouncementPopup />
      <Navigation />

      <main>
        <HeroSection />
        <EventStory />
        <EventDashboard />
        <FAQ />
        <Contact />
      </main>

      <Footer />
    </SoundProvider>
  );
}
