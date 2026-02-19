import React, { useState } from "react";
import { ChevronDown, ChevronUp, Users, Heart, Target } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-block bg-secondary text-white border-2 border-black px-4 py-1 rounded-full font-bold text-sm tracking-wide mb-4 shadow-neo-sm">
          ABOUT US
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
          Built by Devs, For Devs
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Stepzen bridges the gap between talented junior developers and tech
          companies looking for fresh perspectives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          {
            icon: Target,
            title: "Mission",
            text: "To eliminate the friction in finding early-career tech roles.",
          },
          {
            icon: Users,
            title: "Community",
            text: "A collective of 5,000+ developers supporting each other.",
          },
          {
            icon: Heart,
            title: "Values",
            text: "Transparency, speed, and equal opportunity for all.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border-2 border-black rounded-xl p-6 text-center shadow-neo hover:-translate-y-1 transition-transform"
          >
            <div className="inline-flex p-3 bg-gray-100 rounded-full border-2 border-black mb-4">
              <item.icon size={24} />
            </div>
            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-black rounded-xl p-8 shadow-neo">
        <h2 className="text-2xl font-display font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <Accordion title="Is Stepzen free for students?">
            Yes! Stepzen is completely free for internship seekers. We are
            supported by the companies that post jobs.
          </Accordion>
          <Accordion title="How do I verify the internships?">
            Our team manually vets every listing to ensure it's a legitimate
            opportunity with active mentors.
          </Accordion>
          <Accordion title="Can I apply if I'm self-taught?">
            Absolutely. 40% of our successful placements are self-taught
            developers. Skills {">"} Degrees.
          </Accordion>
        </div>
      </div>
    </div>
  );
};

const Accordion: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 font-bold text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t-2 border-gray-100 text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
};

export default About;
