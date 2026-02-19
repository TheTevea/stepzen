'use client';

import React, { useState } from 'react';
import { Send, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Save to local storage mock
    const message = {
        name: formData.get('name'),
        email: formData.get('email'),
        msg: formData.get('message'),
        date: new Date().toISOString()
    };
    
    const existing = JSON.parse(localStorage.getItem('stepzen_contacts') || '[]');
    localStorage.setItem('stepzen_contacts', JSON.stringify([...existing, message]));

    setIsSubmitted(true);
  };

  return (
    <PageTemplate>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
           <div className="inline-block bg-accent text-white border-2 border-black px-4 py-1 rounded-full font-bold text-sm tracking-wide mb-4 shadow-neo-sm">
             CONTACT US
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-bold">Let&apos;s Talk</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
           {/* Info */}
           <div className="space-y-8">
              <div className="bg-primary/10 border-2 border-black rounded-xl p-8 shadow-neo">
                 <h3 className="font-bold text-2xl mb-4">Get in touch</h3>
                 <p className="text-gray-700 mb-6">Have a question about a listing or want to partner with us? Drop us a line.</p>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center">
                          <Mail size={20} />
                       </div>
                       <span className="font-bold">hello@stepzen.dev</span>
                    </div>
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center">
                          <Send size={20} />
                       </div>
                       <span className="font-bold">@stepzen_support</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center">
                          <MapPin size={20} />
                       </div>
                       <span className="font-bold">Remote, Earth 🌍</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Form */}
           <div className="bg-white border-2 border-black rounded-xl p-8 shadow-neo">
              {isSubmitted ? (
                 <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
                       <Send size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-gray-600">We&apos;ll get back to you within 24 hours.</p>
                    <Button className="mt-6" variant="outline" onClick={() => setIsSubmitted(false)}>Send Another</Button>
                 </div>
              ) : (
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                       <label className="block font-bold text-sm mb-2">Name</label>
                       <input required name="name" type="text" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors" placeholder="Jane Doe" />
                    </div>
                     <div>
                       <label className="block font-bold text-sm mb-2">Email</label>
                       <input required name="email" type="email" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors" placeholder="jane@example.com" />
                    </div>
                     <div>
                       <label className="block font-bold text-sm mb-2">Message</label>
                       <textarea required name="message" rows={4} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors" placeholder="How can we help?"></textarea>
                    </div>
                    <Button type="submit" fullWidth size="lg">Send Message</Button>
                 </form>
              )}
           </div>
        </div>
      </div>
    </PageTemplate>
  );
}
