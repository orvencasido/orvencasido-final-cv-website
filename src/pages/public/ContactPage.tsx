import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { contactSchema, ContactFormData } from '../../lib/schemas';
import { createContactMessage, getProfile } from '../../lib/services';
import { Profile } from '../../types';
import { StatusBadge } from '../../components/ui/CommonUI';
import { useToast } from '../../components/ui/Toast';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load contact profile:', err);
      }
    }
    loadProfile();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await createContactMessage({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });

      setIsSuccess(true);
      showToast('Message sent successfully!', 'success');
      reset();
    } catch (err) {
      console.error('Error submitting message:', err);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <p className="eyebrow mb-3">Contact</p>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink">
          Let's build something reliable.
        </h1>
        <p className="mt-4 text-base text-muted max-w-2xl leading-relaxed">
          Whether you're looking for a full-stack engineer, cloud architecture consultation, or technical collaboration, reach out directly below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6 md:col-span-1">
          <div className="p-7 rounded-3xl border border-line bg-card space-y-6 shadow-xs">
            <h2 className="font-display font-semibold text-lg text-ink border-b border-line pb-4">
              Direct Contact
            </h2>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                <div>
                  <p className="eyebrow text-[10px]">Email</p>
                  {profile?.email ? (
                    <a
                      href={`mailto:${profile.email}`}
                      className="font-medium text-ink hover:text-copper transition-colors"
                    >
                      {profile.email}
                    </a>
                  ) : (
                    <span className="font-medium text-muted">Not configured</span>
                  )}
                </div>
              </div>

              {profile?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                  <div>
                    <p className="eyebrow text-[10px]">Phone</p>
                    <span className="font-medium text-ink">
                      {profile.phone}
                    </span>
                  </div>
                </div>
              )}

              {profile?.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                  <div>
                    <p className="eyebrow text-[10px]">Location</p>
                    <span className="font-medium text-ink">
                      {profile.location}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-line space-y-2">
              <p className="eyebrow text-[10px]">Availability Status</p>
              <StatusBadge status={profile?.availability_status || 'available'} type="availability" />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-line bg-paper text-xs text-muted flex items-center gap-3 font-medium">
            <Clock className="w-4 h-4 text-copper shrink-0" />
            <span>Average response time: &lt; 24 hours</span>
          </div>
        </div>

        {/* Form area */}
        <div className="md:col-span-2">
          <div className="p-7 sm:p-9 rounded-3xl border border-line bg-card space-y-6 shadow-xs">
            {isSuccess && (
              <div className="p-5 rounded-2xl bg-paper border border-copper text-ink text-sm flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-copper shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Message Received!</p>
                  <p className="text-xs mt-1 text-muted leading-relaxed">
                    Thank you for reaching out. Your message has been saved and I will respond to your email shortly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    Your Name <span className="text-copper">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Vance"
                    {...register('name')}
                    className="w-full px-4 py-3 text-sm bg-paper border border-line rounded-2xl focus:outline-none focus:border-copper transition-colors text-ink placeholder:text-muted-subtle"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    Your Email <span className="text-copper">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. alex@company.com"
                    {...register('email')}
                    className="w-full px-4 py-3 text-sm bg-paper border border-line rounded-2xl focus:outline-none focus:border-copper transition-colors text-ink placeholder:text-muted-subtle"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Subject <span className="text-copper">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Web Project / Opportunity"
                  {...register('subject')}
                  className="w-full px-4 py-3 text-sm bg-paper border border-line rounded-2xl focus:outline-none focus:border-copper transition-colors text-ink placeholder:text-muted-subtle"
                />
                {errors.subject && (
                  <p className="text-xs text-red-500">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Message <span className="text-copper">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Write your message here..."
                  {...register('message')}
                  className="w-full px-4 py-3 text-sm bg-paper border border-line rounded-2xl focus:outline-none focus:border-copper transition-colors text-ink placeholder:text-muted-subtle resize-none"
                />
                {errors.message && (
                  <p className="text-xs text-red-500">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 text-xs font-semibold text-[#FAF8F5] dark:text-[#111F24] bg-[#111F24] dark:bg-[#FAF8F5] hover:bg-copper dark:hover:bg-copper dark:hover:text-white rounded-full shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
