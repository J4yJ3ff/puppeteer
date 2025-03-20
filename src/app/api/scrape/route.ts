import { type NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface ScrapeData {
  title?: string;
  price?: string;
  category?: string;
  short_description?: string;
  long_description?: string;
  images?: string[];
  features?: string[];
}

// Replace any references to nemsiholdings with almuritech
const replaceReferences = (html?: string): string => {
  if (!html) return "";
  // Replace all occurrences of nemsiholdings with almuritech.com (case insensitive)
  return html.replace(/nemsiholdings\.co\.ke/gi, "almuritech.com");
};

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const data: ScrapeData = await page.evaluate(() => {
      const title = document
        .querySelector(".product_title.entry-title")
        ?.textContent?.trim();

      // Get price - remove currency symbol if needed
      const priceElement = document.querySelector(
        ".price .woocommerce-Price-amount"
      );
      const price = priceElement?.textContent?.trim();

      // Get category
      const categoryElement = document.querySelector(".posted_in a");
      const category = categoryElement?.textContent?.trim();

      // Process short description
      const shortDescElement = document.querySelector(".summary.entry-summary");
      if (shortDescElement) {
        // Remove specified elements
        shortDescElement.querySelector(".product_title.entry-title")?.remove();
        shortDescElement.querySelector(".price")?.remove();
        shortDescElement.querySelector("form")?.remove();
        shortDescElement.querySelector(".product_meta")?.remove();
        shortDescElement.querySelector(".woocommerce-multi-currency")?.remove();
      }
      const short_description = shortDescElement?.innerHTML?.trim();

      // Get long description
      const long_description = document
        .querySelector("#tab-description")
        ?.innerHTML?.trim();

      // Get all product images
      const images = Array.from(
        document.querySelectorAll(
          ".woocommerce-product-gallery__image img, #tab-description img"
        )
      )
        .map((img) => (img as HTMLImageElement).src)
        .filter((src) => src && !src.includes("placeholder"));

      // Get features if available
      const features: string[] = [];
      const descriptionText =
        document.querySelector("#tab-description")?.textContent;
      if (descriptionText) {
        // Extract features from description if they exist
        const featuresList = document.querySelector("#tab-description ul");
        if (featuresList) {
          Array.from(featuresList.querySelectorAll("li")).forEach((li) => {
            const text = li.textContent?.trim();
            if (text) features.push(text);
          });
        }
      }

      return {
        title,
        price,
        category,
        short_description,
        long_description,
        images,
        features,
      };
    });

    // Apply the replacement to all HTML content
    data.short_description = replaceReferences(data.short_description);
    data.long_description = replaceReferences(data.long_description);
    data.features = data.features?.map(replaceReferences);

    await browser.close();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
