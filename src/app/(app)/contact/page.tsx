'use client'

import React, { useState } from 'react'
import { useReveal } from '@/hooks/useReveal'

const WHATSAPP = '94776952531'

const contactInfo = [
  {
    label: 'Address',
    value: '771 Jaffna-Kankesanturai Rd, Jaffna 40000',
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  },
  {
    label: 'Phone',
    value: '+94 77 695 2531',
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.001 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  },
  {
    label: 'Email',
    value: 'hello@mixiekadai.lk',
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline strokeLinecap="round" strokeLinejoin="round" points="22,6 12,13 2,6"/></svg>,
  },
  {
    label: 'Hours',
    value: 'Mon–Sat 9am–7pm · Sunday 10am–4pm',
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline strokeLinecap="round" strokeLinejoin="round" points="12,6 12,12 16,14"/></svg>,
  },
]

export default function ContactPage() {
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)
  const formRef = useReveal()

  const inputClass =
    'w-full border border-brand-surface focus:border-brand-navy outline-none px-4 py-2.5 font-body text-sm text-brand-navy bg-white transition-colors duration-200 rounded'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = encodeURIComponent(`Hi Mixie Kadai! My name is ${name} (${phone}).\n\n${message}`)
    window.open(`https://wa.me/${WHATSAPP}?text=${text}`, '_blank')
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Page Hero */}
      <div className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">Get in Touch</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4 leading-tight">
            We&apos;d Love to<br className="hidden md:block" /> Hear From You
          </h1>
          <p className="font-body text-white/70 text-lg max-w-xl">
            Visit us in Jaffna or send us a message — we&apos;ll get back to you quickly.
          </p>
        </div>
      </div>

      {/* Form + Info */}
      <section ref={formRef as React.RefObject<HTMLElement>} className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

          {/* Contact form */}
          <div className="reveal reveal-left lg:col-span-3">
            <h2 className="font-display text-2xl font-semibold text-brand-navy mb-6">Send a Message</h2>

            {sent ? (
              <div className="bg-brand-gold-light border border-brand-gold rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-display text-xl font-semibold text-brand-navy mb-2">WhatsApp Opened!</p>
                <p className="font-body text-sm text-brand-muted mb-4">
                  Your message has been pre-filled in WhatsApp. Just hit send to reach us.
                </p>
                <button
                  onClick={() => { setSent(false); setName(''); setPhone(''); setMessage('') }}
                  className="font-body text-sm text-brand-gold underline underline-offset-4 hover:text-brand-navy transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="font-body text-sm font-medium text-brand-navy block mb-1.5">
                    Full Name <span className="text-brand-gold">*</span>
                  </label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputClass} />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-brand-navy block mb-1.5">
                    Phone / WhatsApp <span className="text-brand-gold">*</span>
                  </label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+94 77 XXX XXXX" className={inputClass} />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-brand-navy block mb-1.5">
                    Message <span className="text-brand-gold">*</span>
                  </label>
                  <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help you?" className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <button
                    type="submit"
                    className="flex items-center gap-2.5 font-body text-sm font-medium bg-[#25D366] hover:bg-[#1da851] text-white px-7 py-3 rounded transition-colors duration-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Send via WhatsApp
                  </button>
                  <p className="font-body text-xs text-brand-muted mt-2">
                    You&apos;ll be redirected to WhatsApp to complete sending.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Contact info card */}
          <div className="reveal reveal-right delay-2 lg:col-span-2">
            <div className="bg-brand-surface rounded-xl p-8">
              <h2 className="font-display text-2xl font-semibold text-brand-navy mb-6">Contact Info</h2>
              <div className="flex flex-col gap-6">
                {contactInfo.map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand-gold/10 rounded-lg flex items-center justify-center shrink-0 text-brand-gold mt-0.5">
                      {icon}
                    </div>
                    <div>
                      <p className="font-body text-xs font-semibold text-brand-muted uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="font-body text-sm text-brand-navy">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-brand-navy/10">
                <p className="font-body text-xs font-semibold tracking-widest uppercase text-brand-muted mb-4">Follow Us</p>
                <div className="flex items-center gap-4">
                  <a href="https://www.instagram.com/mixie_kadai" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-brand-navy/50 hover:text-brand-gold transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                      <rect x="2" y="2" width="20" height="20" rx="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/share/18cTEreLXk/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-brand-navy/50 hover:text-brand-gold transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl overflow-hidden border border-brand-surface">
            <iframe
              title="Mixie Kadai location"
              src="https://maps.google.com/maps?q=771+Jaffna-Kankesanturai+Rd,+Jaffna+40000,+Sri+Lanka&output=embed&z=15"
              width="100%"
              height="420"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

    </div>
  )
}
