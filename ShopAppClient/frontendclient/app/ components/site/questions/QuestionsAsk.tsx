import { FAQItem } from '@/components/faq-item';
import React from 'react';

export default function QuestionsAsk() {
  const faqs = [
    {
      question: 'What is your return policy?',
      answer:
        'We offer a 30-day money-back guarantee on all products. If you are not satisfied, simply return the item in its original condition for a full refund.',
    },
    {
      question: 'How long does shipping take?',
      answer:
        'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days. Free shipping applies to orders over $50.',
    },
    {
      question: 'Are your products authentic?',
      answer:
        'Yes! All products are 100% authentic and sourced directly from official manufacturers. We guarantee authenticity or your money back.',
    },
    {
      question: 'Do you offer international shipping?',
      answer:
        'We currently ship to over 150 countries worldwide. Shipping costs and delivery times vary by location. Calculate your shipping at checkout.',
    },
    {
      question: 'How can I track my order?',
      answer:
        'You will receive a tracking number via email once your order ships. Use this number to track your package in real-time on our website.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are secure.',
    },
  ];
  return (
    <section className='py-16 md:py-24 bg-slate-50'>
      <div className='container mx-auto px-4'>
        <div className='max-w-3xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
              Frequently Asked Questions
            </h2>
            <p className='text-lg text-slate-600'>
              Find answers to common questions about our products and services
            </p>
          </div>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
