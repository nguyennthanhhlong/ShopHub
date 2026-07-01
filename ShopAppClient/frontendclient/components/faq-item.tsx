'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className='border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors'>
      <button
        onClick={() => setOpen(!open)}
        className='w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left'
      >
        <span className='font-semibold text-slate-900'>{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-slate-600 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className='px-6 pb-6 pt-2 border-t border-slate-200 bg-slate-50'>
          <p className='text-slate-600 leading-relaxed'>{answer}</p>
        </div>
      )}
    </div>
  );
}
