import { type NextRequest, NextResponse } from "next/server";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WC_URL || "",
  consumerKey: process.env.WC_CONSUMER_KEY || "",
  consumerSecret: process.env.WC_CONSUMER_SECRET || "",
  version: "wc/v3",
});

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();

    console.log("Received product data:", productData);

    if (!productData.title) {
      return NextResponse.json(
        { error: "Missing required field: title" },
        { status: 400 }
      );
    }

    // Format the description to include code and range if available
    let description = productData.short_description || "";
    if (productData.code) {
      description =
        `<p><strong>Code:</strong> ${productData.code}</p>` + description;
    }
    if (productData.range) {
      description =
        `<p><strong>Range:</strong> ${productData.range}</p>` + description;
    }

    const formattedProductData = {
      name: productData.code
        ? `${productData.title} - ${productData.code}`
        : productData.title,
      type: "simple",
      // Remove price as requested
      regular_price: "", // Empty string for price
      description: description,
      short_description: productData.short_description || "",
      images:
        productData.images && productData.images.length > 0
          ? productData.images.map((url: string) => ({ src: url }))
          : [],
      // Add Essco to brands array
      brands: ["Essco"],
      // Set stock status to instock by default
      stock_status: "instock",
      // Add category if available
      categories: productData.range ? [{ name: productData.range }] : undefined,
    };

    console.log("Formatted product data:", formattedProductData);

    const response = await api.post("products", formattedProductData);

    console.log("WooCommerce API response:", response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error uploading product:", error);

    if (error.response && error.response.data) {
      console.error("API error details:", error.response.data);
      return NextResponse.json(
        { error: JSON.stringify(error.response.data) },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
