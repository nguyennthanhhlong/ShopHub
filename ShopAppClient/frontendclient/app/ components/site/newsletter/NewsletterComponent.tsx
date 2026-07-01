import { NewsletterForm } from '@/components/newsletter-form';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import React from 'react';

export default function NewsletterComponent() {
  return (
    <>
      <section className='py-16 md:py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6'>
              <h2 className='text-3xl md:text-4xl font-bold'>
                Special Offers & Exclusive Deals
              </h2>
              <p className='text-lg text-slate-300'>
                Get instant access to exclusive discounts, early product
                launches, and member-only deals. Subscribe now and save up to
                20% on your first purchase!
              </p>
              <div className='flex items-center gap-4 text-sm text-slate-300'>
                <Check className='h-5 w-5 text-green-400' />
                <span>Exclusive member discounts</span>
              </div>
              <div className='flex items-center gap-4 text-sm text-slate-300'>
                <Check className='h-5 w-5 text-green-400' />
                <span>Early access to new products</span>
              </div>
              <div className='flex items-center gap-4 text-sm text-slate-300'>
                <Check className='h-5 w-5 text-green-400' />
                <span>Birthday specials and rewards</span>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20'>
              <h3 className='text-2xl font-bold mb-6'>
                Subscribe to Our Newsletter
              </h3>
              <NewsletterForm />
              <p className='text-sm text-slate-300 mt-4 text-center'>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='py-16 md:py-24 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center space-y-8'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900'>
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className='text-lg text-slate-600'>
              Join thousands of satisfied customers who have discovered the
              perfect blend of quality and convenience.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button size='lg' className='text-base px-8 py-6 h-auto'>
                Start Shopping Now
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='text-base px-8 py-6 h-auto'
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
