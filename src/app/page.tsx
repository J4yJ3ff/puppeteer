import { useState } from "react";
import ScraperForm from "./components/ScraperForm";
import Results from "./components/Results";

export default function Home() {
  const [scrapedData, setScrapedData] = useState(null);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Product Scraper</h1>
      <ScraperForm onScrape={setScrapedData} />
      <Results data={scrapedData} />
    </div>
  );
}
