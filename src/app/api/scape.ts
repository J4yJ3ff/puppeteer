import puppeteer from "puppeteer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { url } = req.body;
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => ({
      title: document.querySelector(".product-title")?.innerText.trim(),
      price: document
        .querySelector(".price")
        ?.innerText.replace(/[^0-9.]/g, ""),
      description: document.querySelector(".description")?.innerText.trim(),
      images: Array.from(document.querySelectorAll(".product-images img")).map(
        (img) => img.src
      ),
    }));

    await browser.close();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
