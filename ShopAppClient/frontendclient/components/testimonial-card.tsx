import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
}

export function TestimonialCard({
  name,
  role,
  content,
  rating,
  initials,
}: TestimonialCardProps) {
  return (
    <div className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-100'>
      <div className='flex items-center gap-1 mb-4'>
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className='h-4 w-4 fill-yellow-400 text-yellow-400' />
        ))}
      </div>
      <p className='text-slate-600 mb-6 leading-relaxed'>{content}</p>
      <div className='flex items-center gap-4'>
        <Avatar className='h-12 w-12'>
          <AvatarFallback className='bg-slate-200 text-slate-900 font-semibold'>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className='font-semibold text-slate-900'>{name}</p>
          <p className='text-sm text-slate-600'>{role}</p>
        </div>
      </div>
    </div>
  );
}
