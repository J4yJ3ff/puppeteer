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

// Add a helper function to replace phoneplace references in the scrape route
const replacePhoneplaceReferences = (html?: string): string => {
  if (!html) return "";
  // Replace all occurrences of phoneplace or phoneplacekenya with almuritech.com (case insensitive)
  return html.replace(/phoneplacekenya|phoneplace/gi, "almuritech.com");
};

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
        shortDescElement.querySelector(".product_title.entry-title")?.remove();
        shortDescElement.querySelector("h1.product_title")?.remove(); // Alternative selector for the title
        shortDescElement.querySelector(".ts-product-ratings-stock")?.remove();
        shortDescElement.querySelector(".ts-summary-custom-content")?.remove();
        shortDescElement.querySelector("form")?.remove();

        // Remove price element
        shortDescElement.querySelector(".price")?.remove();
        shortDescElement.querySelector("p.price")?.remove(); // Alternative selector for price

        // Remove SKU and Tags
        shortDescElement.querySelector(".meta-content")?.remove();
        shortDescElement.querySelector(".sku-wrapper")?.remove();
        shortDescElement.querySelector(".tags-link")?.remove();

        // Clean up empty parent elements
        const cleanElements = shortDescElement.querySelectorAll(
          ".woocommerce-product-details__short-description, .woobt-wrap"
        );
        cleanElements.forEach((el) => {
          if (el.innerHTML.trim() === "") el.remove();
        });
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

    // Apply the replacement to all HTML content
    data.short_description = replacePhoneplaceReferences(
      data.short_description
    );
    data.long_description = replacePhoneplaceReferences(data.long_description);
    data.features = data.features?.map(replacePhoneplaceReferences);

    await browser.close();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
