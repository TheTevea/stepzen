'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Briefcase, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';
import { NeoInput } from '@/components/NeoInput';
import { NeoTextarea } from '@/components/NeoTextarea';
import { NeoSelect, SelectOption } from '@/components/NeoSelect';
import { NeoDatePicker } from '@/components/NeoDatePicker';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { supabase } from '@/lib/supabase';

const DAILY_LIMIT = 3;

export default function PostInternship() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Fetch today's post count
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch('/api/jobs/my-count', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRemaining(data.remaining);
        }
      } catch {
        // silently fail – user can still attempt to post
      }
    })();
  }, [user]);

  // Fetch categories from DB
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const cats = await res.json();
          if (cats.length > 0) {
            setCategoryOptions(cats.map((c: { id: string; name: string }) => ({
              value: c.id,
              label: c.name,
            })));
          }
        }
      } catch {
        // fallback handled below
      }
    })();
  }, []);

  // Fallback hardcoded categories if DB is empty
  const defaultCategoryOptions: SelectOption[] = [
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Fullstack', label: 'Fullstack' },
    { value: 'Design', label: 'Design' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Data', label: 'Data' },
  ];

  const activeCategoryOptions = categoryOptions.length > 0 ? categoryOptions : defaultCategoryOptions;

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Remote',
    category: '',
    summary: '',
    responsibilities: '',
    requirements: '',
    skills: '',
    duration: '',
    stipend: '',
    deadline: '',
    telegramApplyLink: '',
  });

  // Set default category once options load
  useEffect(() => {
    if (activeCategoryOptions.length > 0 && !form.category) {
      setForm(prev => ({ ...prev, category: activeCategoryOptions[0].value }));
    }
  }, [activeCategoryOptions, form.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showAlert('You must be logged in to post.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Split multi-line fields into arrays, filter out blank lines
      const responsibilitiesArr = form.responsibilities
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const requirementsArr = form.requirements
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const skillsArr = form.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: form.title,
          companyName: form.company,
          description: form.summary,
          telegramLink: form.telegramApplyLink,
          categoryId: form.category,
          location: form.location || null,
          jobType: form.type || null,
          responsibilities: responsibilitiesArr,
          requirements: requirementsArr,
          skills: skillsArr,
          duration: form.duration || null,
          stipend: form.stipend || null,
          deadline: form.deadline || null,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        showAlert(data.error || 'Daily post limit reached.', 'error');
        setRemaining(0);
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        showAlert(data.error || 'Failed to create post.', 'error');
        setIsSubmitting(false);
        return;
      }

      setRemaining(data.remaining ?? null);
      showAlert('Internship posted successfully! It will appear after admin review.', 'success');
      router.push('/internships');
    } catch {
      showAlert('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <PageTemplate>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTemplate>
    );
  }

  const typeOptions: SelectOption[] = [
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Onsite', label: 'Onsite' },
  ];

  const limitReached = remaining !== null && remaining <= 0;

  return (
    <PageTemplate>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/internships" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Internships
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 bg-secondary text-white border-2 border-black px-4 py-1 rounded-full font-bold text-sm tracking-wide mb-4 shadow-neo-sm">
            <Briefcase size={16} />
            HIRE TALENT
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Post an Internship</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">Fill in the details below to publish your listing and find great candidates.</p>
        </div>

        {/* Daily Limit Indicator */}
        {remaining !== null && (
          <div className={`mb-6 flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-bold text-sm animate-in fade-in duration-300
            ${limitReached
              ? 'border-red-400 bg-red-50 text-red-600'
              : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
          >
            {limitReached ? (
              <>
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                <span>You've reached your daily limit of {DAILY_LIMIT} posts. Try again tomorrow!</span>
              </>
            ) : (
              <>
                <Briefcase size={18} className="text-primary flex-shrink-0" />
                <span>{remaining} of {DAILY_LIMIT} posts remaining today</span>
              </>
            )}
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white border-2 border-black rounded-xl p-6 md:p-8 shadow-neo space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Basic Info */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" /> Basic Info
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <NeoInput
                label="Job Title *"
                required
                name="title"
                value={form.title}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Frontend React Engineer"
              />
              <NeoInput
                label="Company Name *"
                required
                name="company"
                value={form.company}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <NeoInput
                label="Location *"
                required
                name="location"
                value={form.location}
                onChange={handleChange}
                type="text"
                placeholder="e.g. San Francisco, CA"
              />
              <NeoSelect
                label="Work Type *"
                options={typeOptions}
                value={form.type}
                onChange={handleSelectChange('type')}
                placeholder="Select type"
              />
              <NeoSelect
                label="Category *"
                options={activeCategoryOptions}
                value={form.category}
                onChange={handleSelectChange('category')}
                placeholder="Select category"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-100" />

          {/* Description */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full" /> Description
            </h3>

            <NeoTextarea
              label="Summary *"
              required
              name="summary"
              value={form.summary}
              onChange={handleChange}
              rows={3}
              placeholder="Brief overview of the role..."
            />

            <NeoTextarea
              label="Responsibilities *"
              labelHint="(one per line)"
              required
              name="responsibilities"
              value={form.responsibilities}
              onChange={handleChange}
              rows={4}
              placeholder={"Develop responsive web applications\nCollaborate with designers\nWrite clean code"}
            />

            <NeoTextarea
              label="Requirements *"
              labelHint="(one per line)"
              required
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              rows={4}
              placeholder={"Proficiency in JavaScript\nExperience with React\nFamiliarity with Git"}
            />

            <NeoInput
              label="Skills *"
              labelHint="(comma-separated)"
              required
              name="skills"
              value={form.skills}
              onChange={handleChange}
              type="text"
              placeholder="React, TypeScript, Tailwind, Figma"
            />
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-100" />

          {/* Details */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" /> Details & Link
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <NeoInput
                label="Duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                type="text"
                placeholder="e.g. 6 months"
              />
              <NeoInput
                label="Stipend"
                name="stipend"
                value={form.stipend}
                onChange={handleChange}
                type="text"
                placeholder="e.g. $3000/month"
              />
              <NeoDatePicker
                label="Deadline *"
                required
                name="deadline"
                value={form.deadline}
                onChange={(val) => setForm(prev => ({ ...prev, deadline: val }))}
                placeholder="Pick a date"
              />
            </div>

            <NeoInput
              label="Telegram Apply Link *"
              required
              name="telegramApplyLink"
              value={form.telegramApplyLink}
              onChange={handleChange}
              type="url"
              placeholder="https://t.me/..."
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t-2 border-gray-100">
            <Button type="submit" size="lg" fullWidth disabled={isSubmitting || limitReached}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : limitReached ? (
                <span className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Daily Limit Reached
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={18} />
                  Publish Internship
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageTemplate>
  );
}
