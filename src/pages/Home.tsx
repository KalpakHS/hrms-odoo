import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { PlatformSection } from '../components/PlatformSection';
import { WorkflowSection } from '../components/WorkflowSection';
import { RoleBasedSection } from '../components/RoleBasedSection';
import { ProductCTA } from '../components/ProductCTA';
import { Footer } from '../components/Footer';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans transition-colors duration-300">
      {/* Sticky Enterprise Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-grow">
        
        {/* Hero split layout */}
        <Hero />

        {/* Platform 5 Cards Grid */}
        <PlatformSection />

        {/* Connected Request-to-Resolution Workflow */}
        <WorkflowSection />

        {/* Employee vs Manager HR Experiences */}
        <RoleBasedSection />

        {/* Prominent Pre-Footer CTA banner */}
        <ProductCTA />

      </main>

      {/* Oversized Brand Typography Footer */}
      <Footer />
    </div>
  );
};
