"use client";

import dynamic from "next/dynamic";

// Import client components with dynamic to avoid server/client mismatch
const ScraperForm = dynamic(() => import("./components/ScraperForm"), {
  ssr: false,
});
const Results = dynamic(() => import("./components/Results"), { ssr: false });

export default function Home() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Product Scraper</h1>
      <ClientWrapper />
    </div>
  );
}
// Create a client component wrapper to handle state
import { useState } from "react";

function ClientWrapper() {
  const [scrapedData, setScrapedData] = useState(null);

  return (
    <>
      <ScraperForm onScrape={setScrapedData} />
      <Results data={scrapedData} />
    </>
  );
}
