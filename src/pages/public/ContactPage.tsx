import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { contactSchema, ContactFormData } from '../../lib/schemas';
import { createContactMessage, getProfile } from '../../lib/services';
import { Profile } from '../../types';
import { SectionHeader } from '../../components/ui/CommonUI';
import { useToast } from '../../components/ui/Toast';
import { SEOHead } from '../../seo/SEOHead';
import { PAGE_SEO_CONFIG } from '../../seo/seoConfig';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      <SEOHead {...PAGE_SEO_CONFIG.contact} />

      <SectionHeader
        title="Get in Touch"
        description="Reach out for collaborations, engineering opportunities, or general inquiries."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {/* Contact Info Sidebar */}
        <div className="space-y-6 md:col-span-1">
          <div className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 space-y-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-matcha-950 border-b border-beige-200 pb-4">
              Contact Details
            </h2>

            <div className="space-y-4 sm:space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-matcha-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-matcha-700">Email</p>
                  {profile?.email ? (
                    <a
                      href={`mailto:${profile.email}`}
                      className="font-bold text-matcha-900 hover:text-matcha-700 underline break-all inline-block py-1"
                    >
                      {profile.email}
                    </a>
                  ) : (
                    <span className="font-semibold text-matcha-700">Not configured</span>
                  )}
                </div>
              </div>

              {profile?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-matcha-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-matcha-700">Phone</p>
                    <span className="font-bold text-matcha-900">
                      {profile.phone}
                    </span>
                  </div>
                </div>
              )}

              {profile?.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-matcha-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-matcha-700">Location</p>
                    <span className="font-bold text-matcha-900">
                      {profile.location}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form area */}
        <div className="md:col-span-2">
          <div className="p-5 sm:p-6 md:p-8 sm:p-10 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 space-y-6 sm:space-y-8 shadow-xs">
            {isSuccess && (
              <div className="p-4 sm:p-5 rounded-2xl bg-matcha-100 border border-matcha-300 text-matcha-950 text-sm flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-matcha-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-sm sm:text-base">Message Sent Successfully!</p>
                  <p className="text-xs mt-1 text-matcha-800 leading-relaxed">
                    Thank you for reaching out. Your message has been received and I will respond to you shortly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-matcha-900">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 min-h-[48px] text-sm bg-beige-100/70 border border-beige-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs font-medium text-matcha-950 placeholder:text-matcha-700/60"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-matcha-900">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 min-h-[48px] text-sm bg-beige-100/70 border border-beige-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs font-medium text-matcha-950 placeholder:text-matcha-700/60"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-matcha-900">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  className="w-full px-4 py-3 min-h-[48px] text-sm bg-beige-100/70 border border-beige-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs font-medium text-matcha-950 placeholder:text-matcha-700/60"
                />
                {errors.subject && (
                  <p className="text-xs text-red-500 font-medium">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-matcha-900">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Write your message here..."
                  {...register('message')}
                  className="w-full px-4 py-3 text-sm bg-beige-100/70 border border-beige-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs resize-none font-medium text-matcha-950 placeholder:text-matcha-700/60"
                />
                {errors.message && (
                  <p className="text-xs text-red-500 font-medium">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3.5 px-8 text-sm font-extrabold text-beige-50 bg-matcha-900 hover:bg-matcha-800 active:scale-[0.99] rounded-full shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
