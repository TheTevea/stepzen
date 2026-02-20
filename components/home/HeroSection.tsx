'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '../Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="px-6 md:px-4 pb-8 md:py-0 max-w-7xl mx-auto overflow-hidden">
      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="flex justify-start py-4">
          <Image src="/assets/images/hero_image.svg" alt="Hero Illustration" width={256} height={256} className="w-64 h-auto" />
        </div>
        <h1 className="text-5xl font-display font-bold leading-[0.9] text-gray-900 tracking-tighter mb-6">
          INTERNSHIPS<br/>FOR{' '}
          
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DA85B] to-yellow-400 relative inline-block">
            DEVELOPERS
            <svg className="absolute w-full h-2 -bottom-0.5 left-0 text-yellow-400 z-[-1]" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>
        <div className="space-y-6">
          <p className="text-lg text-gray-600 font-medium">
            Skip the noise. Find high-quality tech internships, apply instantly, and kickstart your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/internships">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Internships <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <a href="https://telegram.org" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Join Telegram
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-row items-center gap-12 py-16">
        <div className="w-1/2 space-y-8 relative z-10">
          <h1 className="text-7xl font-display font-bold leading-[0.9] text-gray-900 tracking-tighter">
            INTERNSHIPS FOR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DA85B] to-yellow-400 relative inline-block">
              DEVELOPERS
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 z-[-1]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-md">
            Skip the noise. Find high-quality tech internships, apply instantly, and kickstart your career.
          </p>
          <div className="flex flex-row gap-4">
            <Link href="/internships">
              <Button size="lg">
                Browse Internships <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <a href="https://telegram.org" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg">
                Join Telegram
              </Button>
            </a>
          </div>
        </div>
        <div className="w-1/2 relative flex justify-center">
          <Image src="/assets/images/hero_image.svg" alt="Hero Illustration" width={500} height={500} className="w-full h-auto p-16" />
        </div>
      </div>
    </section>
  );
};
