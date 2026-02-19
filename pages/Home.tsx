import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Terminal, Coffee, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../components/Button';
import { JobCard } from '../components/JobCard';
import { INTERNSHIPS } from '../constants';
import heroImg from '@/src/assets/images/hero_image.svg';


const Home: React.FC = () => {
  const featuredInternships = INTERNSHIPS.slice(0, 3);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="  px-4 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 space-y-8 relative z-10">
             {/* Decorative sticker */}
            

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.9] text-gray-900 tracking-tighter">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/internships">
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
          
          <div className="w-full md:w-1/2 relative">
            <img src={heroImg} alt="Hero Illustration" className="w-full h-auto" />
            {/* Floating badge */}
            {/* <div className="absolute -bottom-6 -left-6 bg-yellow-300 border-2 border-black px-4 py-2 rounded-lg shadow-neo-sm transform -rotate-6">
              <span className="font-bold font-mono">100+ New Roles!</span>
            </div> */}
          </div>

        </div>
      </section>

      {/* Testimonial Strip */}
      <section className="py-12 bg-indigo-50 border-y-2 border-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "Landed my first React role in 2 weeks!", author: "Sarah J.", role: "Frontend Dev" },
              { text: "The filters actually make sense for devs.", author: "Mike T.", role: "Backend Intern" },
              { text: "Love the no-nonsense application process.", author: "Elena R.", role: "Fullstack" }
            ].map((t, i) => (
              <div key={i} className="bg-white border-2 border-black p-4 rounded-lg shadow-neo-sm">
                <p className="text-sm font-medium italic mb-3">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 border border-black overflow-hidden flex items-center justify-center text-xs font-bold">
                    {t.author[0]}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold block">{t.author}</span>
                    <span className="text-gray-500">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          {featuredInternships.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/internships">
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
         <div className="max-w-4xl mx-auto bg-black text-white rounded-xl border-2 border-black p-8 md:p-16 text-center relative overflow-hidden shadow-neo">
            {/* Decorative rotated sticker */}
            <div className="absolute -top-3 -right-3 bg-yellow-300 text-black border-2 border-black px-4 py-1.5 rounded-lg font-bold text-sm transform rotate-6 shadow-neo-sm z-20">
              🔔 Don't Sleep On It!
            </div>

            <div className="relative z-10">
              <div className="inline-block bg-primary text-white border-2 border-black px-4 py-1 rounded-full font-bold text-sm tracking-wide mb-6 shadow-neo-sm">
                STAY UPDATED
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Don't Miss the Next Drop</h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                Internships fill up fast. Join 5,000+ developers getting instant alerts on our Telegram channel.
              </p>
              <a href="https://telegram.org" target="_blank" rel="noreferrer">
                <Button size="lg" className="bg-white text-blue-600 border-2 border-black hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-none transition-all shadow-neo">
                  🚀 Join Telegram Channel
                </Button>
              </a>
            </div>

            {/* Decorative bottom-left sticker */}
            <div className="absolute -bottom-2 -left-2 bg-accent text-white border-2 border-black px-3 py-1 rounded-lg font-bold text-xs transform -rotate-3 shadow-neo-sm z-20">
              5,000+ devs joined ✨
            </div>

            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <svg width="100%" height="100%">
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
               </svg>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;