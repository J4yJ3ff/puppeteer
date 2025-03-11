"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScraperFormProps {
  onScrape: (data: any) => void;
}

export default function ScraperForm({ onScrape }: ScraperFormProps) {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to scrape product");
      }

      const data = await response.json();
      onScrape(data);
    } catch (error) {
      console.error(error);
      setError((error as Error).message || "An error occurred while scraping");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Product URL</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/product"
              required
              className="w-full"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Scraping..." : "Scrape Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
