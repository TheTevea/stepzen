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

  // Fetch locations from DB
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/locations');
        if (res.ok) {
          const locs = await res.json();
          setLocationOptions(locs.map((l: { id: string; name: string }) => ({
            value: l.id,
            label: l.name,
          })));
        }
      } catch {
        // silently fail
      }
    })();
  }, []);

  const activeCategoryOptions = categoryOptions;

  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    company: '',
    locationId: '',
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
    postToTelegram: true,
  });

  // Set default category and location once options load
  useEffect(() => {
    if (activeCategoryOptions.length > 0 && !form.category) {
      setForm(prev => ({ ...prev, category: activeCategoryOptions[0].value }));
    }
  }, [activeCategoryOptions, form.category]);

  useEffect(() => {
    if (locationOptions.length > 0 && !form.locationId) {
      setForm(prev => ({ ...prev, locationId: locationOptions[0].value }));
    }
  }, [locationOptions, form.locationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerFile(e.target.files[0]);
    }
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

      let telegramBannerUrl: string | null = null;

      if (form.postToTelegram && bannerFile) {
        // Convert file to base64 data URI
        telegramBannerUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read banner file.'));
          reader.readAsDataURL(bannerFile);
        });
      }

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
          locationId: form.locationId || null,
          jobType: form.type || null,
          postToTelegram: form.postToTelegram,
          telegramBannerUrl,
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
              <NeoSelect
                label="Location *"
                options={locationOptions}
                value={form.locationId}
                onChange={handleSelectChange('locationId')}
                placeholder="Select location"
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

            <label className="flex items-center gap-3 cursor-pointer mt-4 p-4 border-2 border-black rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="postToTelegram"
                  checked={form.postToTelegram}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 border-2 border-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-2 after:border-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
              <div>
                <span className="font-bold text-sm block">Share to StepZen Telegram Channel</span>
                <span className="text-xs text-gray-600 block">We'll automatically cross-post this internship to our 5,000+ member Telegram channel.</span>
              </div>
            </label>

            {form.postToTelegram && (
              <div className="mt-4 p-4 border-2 border-black rounded-lg bg-gray-50 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="font-bold text-sm block">Banner Image (Optional)</label>
                <span className="text-xs text-gray-500 block mb-2">Upload a banner image to be featured in the Telegram post. Recommended size: 1200x630px.</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-2 file:border-black
                    file:text-sm file:font-bold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90 hover:file:cursor-pointer transition-colors"
                />
                {bannerFile && (
                  <span className="text-xs font-bold text-green-600 mt-1 flex items-center gap-1">
                    Selected: {bannerFile.name}
                  </span>
                )}
              </div>
            )}
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
