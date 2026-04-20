import React from 'react';
import DeveloperPortal from '@/components/developer/DeveloperPortal';
import { Footer } from '@/components/Footer';

const DeveloperPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <DeveloperPortal />
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperPage;
