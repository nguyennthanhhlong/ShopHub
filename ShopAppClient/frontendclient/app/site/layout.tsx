import React from 'react';
import Header from '../ components/site/layout/Header';
import Footer from '../ components/site/layout/Footer';
import FloatingChatBox from '@/components/chat-box';
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <FloatingChatBox />
    </>
  );
}
