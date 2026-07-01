'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-md'>
      {submitted ? (
        <div className='flex items-center justify-center gap-2 h-12 px-4 rounded-lg bg-green-50 border border-green-200'>
          <Check className='h-5 w-5 text-green-600' />
          <span className='text-green-700 font-medium'>
            Thanks for subscribing!
          </span>
        </div>
      ) : (
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Mail className='absolute left-4 top-3 h-5 w-5 text-slate-400' />
            <Input
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='pl-11 h-12'
              required
            />
          </div>
          <Button type='submit' size='lg' className='h-12'>
            Subscribe
          </Button>
        </div>
      )}
    </form>
  );
}
