import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { contactSchema, ContactFormData } from '../../lib/schemas';
import { createContactMessage, getProfile } from '../../lib/services';
import { Profile } from '../../types';
import { SectionHeader, StatusBadge } from '../../components/ui/CommonUI';
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
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12">
      <SectionHeader
        title="Let's Connect and Conquer!"
        description="Interested in collaborating, hiring for cloud & software engineering, or asking a question? Send a message below."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Contact Info Sidebar */}
        <div className="space-y-6 md:col-span-1">
          <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
            <h2 className="text-xl font-extrabold text-matcha-950 border-b border-beige-200 pb-4">
              Direct Contact
            </h2>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-matcha-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-matcha-600 uppercase tracking-wider">Email</p>
                  {profile?.email ? (
                    <a
                      href={`mailto:${profile.email}`}
                      className="font-bold text-matcha-900 hover:text-matcha-700 underline"
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
                    <p className="text-xs font-bold text-matcha-600 uppercase tracking-wider">Phone</p>
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
                    <p className="text-xs font-bold text-matcha-600 uppercase tracking-wider">Location</p>
                    <span className="font-bold text-matcha-900">
                      {profile.location}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-beige-200 space-y-3">
              <p className="text-xs font-extrabold text-matcha-700 uppercase tracking-widest">Availability</p>
              <StatusBadge status={profile?.availability_status || 'available'} type="availability" />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-beige-300 bg-beige-50 text-xs font-semibold text-matcha-700 flex items-center gap-3">
            <Clock className="w-5 h-5 text-matcha-600 shrink-0" />
            <span>Average response time: &lt; 24 hours</span>
          </div>
        </div>

        {/* Form area */}
        <div className="md:col-span-2">
          <div className="p-8 sm:p-10 rounded-3xl border border-beige-300 bg-beige-50 space-y-8 shadow-xs">
            {isSuccess && (
              <div className="p-5 rounded-2xl bg-matcha-100 border border-matcha-300 text-matcha-950 text-sm flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-matcha-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-base">Message Sent Successfully!</p>
                  <p className="text-xs mt-1 text-matcha-800">
                    Thank you for reaching out. Your message has been received and I will respond to you shortly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Orven Casido"
                    {...register('name')}
                    className="w-full px-4 py-3.5 text-sm bg-beige-100 border border-beige-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs font-medium text-matcha-950 placeholder:text-matcha-700/60"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. orvencasidop@gmail.com"
                    {...register('email')}
                    className="w-full px-4 py-3.5 text-sm bg-beige-100 border border-beige-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs font-medium text-matcha-950 placeholder:text-matcha-700/60"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Project Discussion"
                  {...register('subject')}
                  className="w-full px-4 py-3.5 text-sm bg-beige-100 border border-beige-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs font-medium text-matcha-950 placeholder:text-matcha-700/60"
                />
                {errors.subject && (
                  <p className="text-xs text-red-500 font-medium">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Write your message here..."
                  {...register('message')}
                  className="w-full px-4 py-3.5 text-sm bg-beige-100 border border-beige-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs resize-none font-medium text-matcha-950 placeholder:text-matcha-700/60"
                />
                {errors.message && (
                  <p className="text-xs text-red-500 font-medium">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 text-sm font-extrabold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
