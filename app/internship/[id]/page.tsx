'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Copy, CheckCircle, Clock, DollarSign, Flag, X } from 'lucide-react';
import { INTERNSHIPS } from '@/constants';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';
import { useAlert } from '@/context/AlertContext';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export default function InternshipDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const { showAlert } = useAlert();

  // Look up job from static list or user-posted listings
  const [job, setJob] = useState(() => INTERNSHIPS.find(i => i.id === id) || null);

  useEffect(() => {
    if (!job) {
      const userPosts = JSON.parse(localStorage.getItem('stepzen_user_posts') || '[]');
      const found = userPosts.find((p: { id: string }) => p.id === id);
      if (found) setJob(found);
    }
  }, [id, job]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!job) {
    return (
      <PageTemplate>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">Internship not found</h2>
          <Link href="/internships"><Button>Back to List</Button></Link>
        </div>
      </PageTemplate>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Internship at ${job.company}`,
          text: `Check out this ${job.title} role at Stepzen!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showAlert('Link copied!', 'success');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const submission = {
      jobId: job.id,
      jobTitle: job.title,
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      portfolio: formData.get('portfolio'),
      date: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('stepzen_applications') || '[]');
    localStorage.setItem('stepzen_applications', JSON.stringify([...existing, submission]));
    
    setFormStatus('success');
    form.reset();
    setTimeout(() => {
      setShowApplyForm(false);
      setFormStatus('idle');
    }, 3000);
  };

  const REPORT_REASONS = [
    'Scam / Fraud',
    'Misleading information',
    'Expired / Invalid',
    'Inappropriate content',
    'Other',
  ];

  const handleReport = () => {
    if (!reportReason) {
      showAlert('Please select a reason.', 'error');
      return;
    }
    const report = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      reason: reportReason,
      details: reportDetails,
      date: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('stepzen_reports') || '[]');
    localStorage.setItem('stepzen_reports', JSON.stringify([...existing, report]));
    showAlert('Report submitted. Thank you!', 'success');
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
  };

  return (
    <PageTemplate>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/internships" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Internships
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-left-4 duration-500">
            
            {/* Header */}
            <div className="bg-white border-2 border-black rounded-xl p-8 shadow-neo">
               <div className="flex items-start justify-between mb-4">
                 <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">{job.title}</h1>
                    <p className="text-xl font-bold text-gray-500">{job.company}</p>
                 </div>
                 {/* Logo placeholder */}
                 <div className={`w-16 h-16 rounded-xl border-2 border-black flex items-center justify-center font-bold text-3xl text-white
                    ${['bg-pink-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][job.title.length % 4]}`}>
                     {job.company.charAt(0)}
                 </div>
               </div>

               <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="neutral">{job.type}</Badge>
                  <Badge variant="accent">{job.category}</Badge>
                  <Badge variant="warning">Deadline: {job.deadline}</Badge>
               </div>
            </div>

            {/* Details */}
            <div className="bg-white border-2 border-black rounded-xl p-8 shadow-neo space-y-8">
               
               <section>
                 <h3 className="text-lg font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                   <div className="w-2 h-2 bg-primary rounded-full"></div> Overview
                 </h3>
                 <p className="text-gray-700 leading-relaxed">{job.summary}</p>
               </section>

               <section>
                 <h3 className="text-lg font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                   <div className="w-2 h-2 bg-accent rounded-full"></div> Key Responsibilities
                 </h3>
                 <ul className="list-disc pl-5 space-y-2 text-gray-700">
                   {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                 </ul>
               </section>

               <section>
                 <h3 className="text-lg font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div> Requirements
                 </h3>
                 <ul className="list-disc pl-5 space-y-2 text-gray-700">
                   {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                 </ul>
               </section>

               <section>
                 <h3 className="text-lg font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                   <div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Skills
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {job.skills.map((skill, i) => (
                     <span key={i} className="px-3 py-1 bg-gray-50 border border-black rounded-md font-mono text-sm font-semibold">
                       {skill}
                     </span>
                   ))}
                 </div>
               </section>

            </div>
          </div>

          {/* Sidebar / Actions */}
          <div className="lg:col-span-1 space-y-6">
             {/* Sticky Apply Card */}
             <div className="sticky top-24 space-y-6">
                <div className="bg-white border-2 border-black rounded-xl p-6 shadow-neo">
                   <h3 className="font-display font-bold text-xl mb-6 text-center">Interested?</h3>
                   
                   <div className="grid grid-cols-2 gap-4 text-sm font-bold text-gray-600 mb-6">
                      <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                         <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Duration</span>
                         <span>{job.duration || 'Flexible'}</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                         <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Stipend</span>
                         <span>{job.stipend || 'Unpaid'}</span>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <a href={job.telegramApplyLink} target="_blank" rel="noreferrer" className="block">
                        <Button fullWidth size="lg">Apply via Telegram</Button>
                      </a>
                      
                      <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={() => setShowApplyForm(!showApplyForm)}
                      >
                        {showApplyForm ? 'Close Form' : 'Apply on Website'}
                      </Button>
                   </div>

                    <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-100">
                       <button onClick={() => { navigator.clipboard.writeText(window.location.href); showAlert('Link copied!', 'success'); }} className="text-gray-400 hover:text-black transition-colors" title="Copy Link">
                          <Copy size={20} />
                       </button>
                       <button onClick={handleShare} className="text-gray-400 hover:text-black transition-colors" title="Share">
                          <Share2 size={20} />
                       </button>
                       <span className="w-px h-5 bg-gray-200" />
                       <button onClick={() => setShowReportModal(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors">
                          <Flag size={16} />
                          Report
                       </button>
                    </div>
                </div>

                {/* Local Form */}
                {showApplyForm && (
                  <div className="bg-white border-2 border-black rounded-xl p-6 shadow-neo animate-in zoom-in-95 duration-300">
                     {formStatus === 'success' ? (
                       <div className="text-center py-8">
                          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                          <h4 className="font-bold text-xl">Application Sent!</h4>
                          <p className="text-gray-600 mt-2">Good luck! We saved your details.</p>
                       </div>
                     ) : (
                       <form onSubmit={handleFormSubmit} className="space-y-4">
                          <h4 className="font-bold text-lg mb-4">Quick Application</h4>
                          <div>
                            <label className="block text-sm font-bold mb-1">Full Name</label>
                            <input required name="name" type="text" className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1">Email</label>
                            <input required name="email" type="email" className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1">Portfolio URL (Optional)</label>
                            <input name="portfolio" type="url" className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1">Short Message</label>
                            <textarea required name="message" rows={3} className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none"></textarea>
                          </div>
                          <Button type="submit" fullWidth variant="secondary">Submit Application</Button>
                       </form>
                     )}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white border-2 border-black rounded-xl shadow-neo w-full max-w-md p-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl">Report this listing</h3>
                <button onClick={() => { setShowReportModal(false); setReportReason(''); setReportDetails(''); }} className="text-gray-400 hover:text-black transition-colors">
                  <X size={22} />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">Help us keep internship listings safe by reporting suspicious or problematic posts.</p>

              <div className="space-y-2 mb-5">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all duration-150
                      ${reportReason === reason
                        ? 'border-black bg-primary/10 text-black shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold mb-1">Additional details (optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => { setShowReportModal(false); setReportReason(''); setReportDetails(''); }}>
                  Cancel
                </Button>
                <button
                  onClick={handleReport}
                  className="w-full px-6 py-2.5 bg-red-500 text-white font-bold rounded-full border-2 border-black shadow-neo hover:-translate-y-1 hover:shadow-none transition-all duration-200"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
