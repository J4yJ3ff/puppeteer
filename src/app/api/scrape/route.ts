import { type NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface ScrapeData {
  title?: string;
  price?: string;
  code?: string;
  range?: string;
  short_description?: string;
  long_description?: string;
  images?: string[];
  features?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Use the simplest launch configuration - let Puppeteer handle everything
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const data: ScrapeData = await page.evaluate(() => {
      // Get product title
      const title = document
        .querySelector(".signle-product-title")
        ?.textContent?.trim();

      // Get price - remove currency symbol if needed
      const priceElement = document.querySelector(".price-special");
      const price = priceElement?.textContent?.trim();

      // Get product code
      const codeElement = document.querySelector(".product-modal-name");
      const code = codeElement?.textContent?.trim();

      // Get product range
      const rangeElement = document.querySelector(".product-range-name");
      const range = rangeElement?.textContent?.trim();

      // Get short description
      const shortDescElement = document.querySelector(
        ".product-description-name"
      );
      const short_description = shortDescElement?.innerHTML?.trim();

      // Get all product images
      const images = Array.from(
        document.querySelectorAll(".product-thumbnail-link")
      )
        .map((link) => (link as HTMLAnchorElement).href)
        .filter((src) => src && !src.includes("placeholder"));

      // Add main image if it exists
      const mainImage = document.querySelector(
        ".main-image"
      ) as HTMLAnchorElement;
      if (mainImage && mainImage.href) {
        if (!images.includes(mainImage.href)) {
          images.unshift(mainImage.href);
        }
      }

      // Get features from description if they exist
      const features: string[] = [];
      const descriptionText = document.querySelector(
        ".product-description-name"
      )?.textContent;
      if (descriptionText) {
        // Split by newlines or commas if it contains a list-like structure
        const lines = descriptionText.split(/[,\n]+/);
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) features.push(trimmed);
        });
      }

      return {
        title,
        price,
        code,
        range,
        short_description,
        images,
        features,
      };
    });

    await browser.close();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
