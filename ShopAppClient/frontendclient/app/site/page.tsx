'use client';
import NewsletterComponent from '../ components/site/newsletter/NewsletterComponent';
import QuestionsAsk from '../ components/site/questions/QuestionsAsk';
import CategoryComponent from '../ components/site/category/CategoryComponent';
import FeatureComponent from '../ components/site/feature/FeatureComponent';
import TopFeatureProduct from '../ components/site/products/TopFeatureProduct';
import Discover from '../ components/site/discover/Discover';
import Testimonials from '../ components/site/testimonial/Testimonials';
import FlashSale from '../ components/site/products/FlashSale';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <Discover />
      <FeatureComponent />
      <FlashSale />
      <CategoryComponent />
      <TopFeatureProduct />
      <Testimonials />
      <QuestionsAsk />
      <NewsletterComponent />

    </div>
  );
}
