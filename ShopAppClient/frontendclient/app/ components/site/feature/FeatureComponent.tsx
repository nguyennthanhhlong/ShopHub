import React from 'react';
import { Truck, Shield, Headphones, Check } from 'lucide-react';

export default function FeatureComponent() {
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over $50',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure transactions',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated customer service',
    },
    {
      icon: Check,
      title: 'Quality Guarantee',
      description: '30-day money back',
    },
  ];
  return (
    <section id='features' className='py-16 md:py-24 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors'
            >
              <div className='h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-4'>
                <feature.icon className='h-7 w-7 text-slate-900' />
              </div>
              <h3 className='text-lg font-semibold text-slate-900 mb-2'>
                {feature.title}
              </h3>
              <p className='text-sm text-slate-600'>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
