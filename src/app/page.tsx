"use client";

import { useState } from "react";
import ScraperForm from "./components/ScraperForm";
import Results from "./components/Results";

export default function Home() {
  const [scrapedData, setScrapedData] = useState(null);
  const [isScraped, setIsScraped] = useState(false);

  const handleScrape = (data: any) => {
    setScrapedData(data);
    setIsScraped(true);
  };

  const handleUpload = async () => {
    // This will be passed to the ScraperForm component
    return true;
  };

  const handleReset = () => {
    setScrapedData(null);
    setIsScraped(false);
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Product Scraper</h1>
      <div className="space-y-8">
        <ScraperForm
          onScrape={handleScrape}
          onUpload={handleUpload}
          onReset={handleReset}
          isScraped={isScraped}
          scrapedData={scrapedData}
        />
        {isScraped && <Results data={scrapedData} />}
      </div>
    </main>
  );
}
