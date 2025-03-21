"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScraperFormProps {
  onScrape: (data: any) => void;
  onUpload: () => Promise<boolean>;
  onReset: () => void;
  isScraped: boolean;
  scrapedData: any;
}

export default function ScraperForm({
  onScrape,
  onUpload,
  onReset,
  isScraped,
  scrapedData,
}: ScraperFormProps) {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadResult(null);

    if (!isScraped) {
      // Scrape mode
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
        setError(
          (error as Error).message || "An error occurred while scraping"
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Upload mode
      try {
        const uploadData = {
          ...scrapedData,
          price: scrapedData.price
            ? scrapedData.price.replace(/[^0-9.]/g, "")
            : "",
        };

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadData),
        });

        const result = await response.json();
        if (response.ok) {
          setUploadResult(`Product uploaded successfully! ID: ${result.id}`);
          // Add a slight delay before resetting
          setTimeout(() => {
            setUrl("");
            onReset();
          }, 2000);
        } else {
          setUploadResult(`Upload failed: ${result.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadResult(`Upload failed: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
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
              placeholder="https://www.esscobathware.com/product/example"
              required={!isScraped}
              disabled={isScraped}
              className="w-full"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {uploadResult && (
              <p
                className={`${
                  uploadResult.includes("failed")
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {uploadResult}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            {loading
              ? isScraped
                ? "Uploading..."
                : "Scraping..."
              : isScraped
              ? "Upload to WooCommerce"
              : "Scrape Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
