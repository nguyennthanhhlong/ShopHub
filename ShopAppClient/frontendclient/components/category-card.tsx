import { Package } from 'lucide-react';

interface CategoryCardProps {
  id: number;
  name: string;
  image?: string;
}

export function CategoryCard({ name, image }: CategoryCardProps) {
  return (
    <div className='relative overflow-hidden rounded-2xl aspect-[4/3] group cursor-pointer shadow-md hover:shadow-xl transition-all duration-500'>
      {/* Background Image */}
      {image ? (
        <img 
          src={image} 
          alt={name} 
          className='absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
        />
      ) : (
        <div className='absolute inset-0 w-full h-full bg-slate-200 flex items-center justify-center transition-transform duration-700 group-hover:scale-110'>
          <Package size={48} className='text-slate-400' />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/40'></div>

      {/* Content */}
      <div className='absolute inset-0 p-6 flex flex-col justify-end items-center text-center'>
        <h3 className='text-2xl font-bold text-white mb-2 tracking-wide drop-shadow-md'>{name}</h3>
        <div className='w-0 h-1 bg-white rounded-full transition-all duration-500 group-hover:w-16'></div>
      </div>
    </div>
  );
}
