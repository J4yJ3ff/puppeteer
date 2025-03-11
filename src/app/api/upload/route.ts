import { type NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface ScrapeData {
  title?: string;
  price?: string;
  short_description?: string;
  long_description?: string;
  images?: string[];
  features?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const data: ScrapeData = await page.evaluate(() => {
      const title = document
        .querySelector(".product_title")
        ?.textContent?.trim();
      const price = document.querySelector(".price")?.textContent?.trim();

      // Process short description
      const shortDescElement = document.querySelector(".summary.entry-summary");
      if (shortDescElement) {
        // Remove specified elements
        shortDescElement.querySelector(".cats-link")?.remove();
        shortDescElement.querySelector(".ts-product-ratings-stock")?.remove();
        shortDescElement.querySelector(".ts-summary-custom-content")?.remove();
        shortDescElement.querySelector("form")?.remove();
      }
      const short_description = shortDescElement?.innerHTML?.trim();

      const long_description = document
        .querySelector(".product-content")
        ?.innerHTML?.trim();

      const images = Array.from(
        document.querySelectorAll(
          ".product-images img, .woocommerce-product-gallery__image img"
        )
      )
        .map((img) => (img as HTMLImageElement).src)
        .filter((src) => src && !src.includes("placeholder"));

      const featuresList = document.querySelector(
        ".features-list, .product-features"
      );
      const features = featuresList
        ? Array.from(featuresList.querySelectorAll("li"))
            .map((li) => li.innerHTML?.trim())
            .filter(Boolean)
        : [];

      return {
        title,
        price,
        short_description,
        long_description,
        images,
        features,
      };
    });

    // Function to remove "phoneplace" from a string
    const removePhoneplace = (str: string) =>
      str.replace(/phoneplace/gi, "").trim();

    // Remove "phoneplace" from all text fields
    data.title = data.title ? removePhoneplace(data.title) : undefined;
    data.short_description = data.short_description
      ? removePhoneplace(data.short_description)
      : undefined;
    data.long_description = data.long_description
      ? removePhoneplace(data.long_description)
      : undefined;
    data.features = data.features
      ? data.features.map(removePhoneplace)
      : undefined;

    await browser.close();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
