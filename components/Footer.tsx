import React from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const resources = [
    { name: 'CV Tips', href: '#' },
    { name: 'Interview Prep', href: '#' },
  ];

  return (
    <footer className="bg-white border-t-2 border-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <img src="/assets/images/logo.svg" alt="Stepzen Logo" className="h-14" />
            </Link>
            <p className="text-sm font-medium text-gray-600 leading-relaxed max-w-xs">
              Helping developers find their first break. We curate the best internships.
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-black uppercase tracking-wider text-sm text-black">Resources</h4>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="font-black uppercase tracking-wider text-sm text-black">Community</h4>
            <p className="text-xs text-gray-500">Get daily internship alerts on Telegram.</p>
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#229ED9] text-white px-4 py-2 rounded-full font-bold text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <Send size={14} />
              Join Channel
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-black py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            © {new Date().getFullYear()} StepZen. All rights reserved.
          </p>
          <p className="text-xs font-medium text-gray-400">
            Version 1.0.0
          </p>
        </div>

      </div>
    </footer>
  );
};