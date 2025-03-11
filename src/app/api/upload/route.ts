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

    if (!productData.title || !productData.price) {
      return NextResponse.json(
        { error: "Missing required fields: title or price" },
        { status: 400 }
      );
    }

    const formattedProductData = {
      name: productData.title,
      type: "simple",
      regular_price: productData.price.toString(),
      description: productData.long_description || "",
      short_description: productData.short_description || "",
      images:
        productData.images && productData.images.length > 0
          ? productData.images.map((url: string) => ({ src: url }))
          : [],
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
