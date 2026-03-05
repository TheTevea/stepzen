'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Terminal, Coffee, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../components/Button';
import { JobCard } from '../components/JobCard';
import { INTERNSHIPS } from '../constants';
import { Internship } from '../types';
import { PageTemplate } from '../components/PageTemplate';
import { HeroSection } from '../components/home/HeroSection';
import { TestimonialStrip } from '../components/home/TestimonialStrip';

/** Map a DB job object (from /api/jobs) to the Internship type used by JobCard */
function mapDbJob(j: Record<string, unknown>): Internship {
  return {
    id: j.id as string,
    title: j.title as string,
    company: j.companyName as string,
    location: ((j.location as Record<string, unknown>)?.name as string) || 'Remote',
    type: ((j.jobType as string) || 'Remote') as Internship['type'],
    category: ((j.category as Record<string, unknown>)?.name as string || 'Fullstack') as Internship['category'],
    postedDate: (j.createdAt as string)?.split('T')[0] || new Date().toISOString().split('T')[0],
    deadline: (j.deadline as string) || (j.expiresAt as string)?.split('T')[0] || '',
    summary: (j.description as string) || '',
    responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities as string[] : [],
    requirements: Array.isArray(j.requirements) ? j.requirements as string[] : [],
    skills: Array.isArray(j.skills) ? j.skills as string[] : [],
    duration: (j.duration as string) || undefined,
    stipend: (j.stipend as string) || undefined,
    telegramApplyLink: j.telegramLink as string,
  };
}

function JobCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white border-2 border-black rounded-xl p-5 shadow-neo animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2 mb-6 flex-grow">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="mt-auto pt-4 border-t-2 border-gray-100 flex gap-3">
        <div className="flex-1 h-9 bg-gray-200 rounded-full" />
        <div className="h-9 w-12 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/jobs');
        if (!cancelled && res.ok) {
          const dbJobs = await res.json();
          const mapped = (dbJobs as Record<string, unknown>[]).map(mapDbJob);
          if (mapped.length > 0) {
            setFeaturedJobs(mapped.slice(0, 3));
          } else {
            // API returned 0 published jobs – use static fallback
            setFeaturedJobs(INTERNSHIPS.slice(0, 3));
          }
        } else if (!cancelled) {
          setFeaturedJobs(INTERNSHIPS.slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          setFeaturedJobs(INTERNSHIPS.slice(0, 3));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <PageTemplate>
      <div className="animate-in fade-in duration-500">
        {/* Hero Section */}
        <HeroSection />

        {/* Testimonial Strip */}
        <TestimonialStrip />

        {/* Trusted By */}
        <section className="py-10 text-center">
          <p className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-6">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
             {/* Placeholder text logos */}
             <span className="text-2xl font-display font-bold">AcmeCorp</span>
             <span className="text-2xl font-display font-bold">Globex</span>
             <span className="text-2xl font-display font-bold">Soylent</span>
             <span className="text-2xl font-display font-bold">Initech</span>
             <span className="text-2xl font-display font-bold">Umbrella</span>
          </div>
        </section>

        {/* Featured Opportunities */}
        <section className="py-20 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
             <div className="inline-block bg-primary text-white border-2 border-black px-4 py-1 rounded-full font-bold text-sm tracking-wide mb-4 shadow-neo-sm">
               OPPORTUNITIES
             </div>
             <h2 className="text-3xl md:text-4xl font-display font-bold">Featured Internships</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : (
              featuredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/internships">
              <Button size="lg" variant="secondary">View All Internships</Button>
            </Link>
          </div>
        </section>

        {/* Quick Tips Snacks */}
        <section className="py-20 bg-yellow-50 border-t-2 border-black relative">
           <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                 <div className="inline-block bg-accent text-white border-2 border-black px-4 py-1 rounded-full font-bold text-sm tracking-wide mb-4 shadow-neo-sm">
                   QUICK SNACKS
                 </div>
                 <h2 className="text-3xl font-display font-bold">Level Up Your Application</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                   { icon: Terminal, title: "Clean Code", text: "Format your snippets. Readability matters." },
                   { icon: Coffee, title: "Be Curious", text: "Show you want to learn, not just earn." },
                   { icon: CheckCircle, title: "Portfolio", text: "Live demos beat GitHub links every time." },
                   { icon: ExternalLink, title: "Follow Up", text: "Send a thank you note after the interview." }
                 ].map((tip, i) => (
                   <div key={i} className="bg-white p-6 rounded-xl border-2 border-black text-center hover:scale-105 transition-transform duration-300">
                      <div className="inline-flex p-3 bg-gray-50 rounded-full border-2 border-black mb-4">
                        <tip.icon size={24} />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                      <p className="text-sm text-gray-600">{tip.text}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                {/* Left: Text content */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-gray-900">Don&apos;t Miss the Next Drop</h2>
                  <p className="text-gray-600 mb-8 max-w-lg text-lg">
                    Internships fill up fast. Join 5,000+ developers getting instant alerts on our Telegram channel.
                  </p>
                  <a href="https://t.me/+xYrIev4OEHk2MTY1" target="_blank" rel="noreferrer">
                    <Button size="lg">
                      🚀 Join Telegram Channel
                    </Button>
                  </a>
                </div>

                {/* Right: Banner image */}
                <div className="flex-1 flex justify-center md:justify-center">
                  <Image src="/assets/images/banner.svg" alt="Stay Updated Banner" width={400} height={400} className="w-full max-w-sm md:max-w-md h-auto" />
                </div>
              </div>
           </div>
        </section>
      </div>
    </PageTemplate>
  );
}
