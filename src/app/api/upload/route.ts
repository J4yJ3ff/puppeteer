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

    // Prepare the product data
    const formattedProductData: any = {
      name: productData.code
        ? `${productData.title} - ${productData.code}`
        : productData.title,
      type: "simple",
      regular_price: "", // Empty string for price
      description: description,
      short_description: productData.short_description || "",
      images:
        productData.images && productData.images.length > 0
          ? productData.images.map((url: string) => ({ src: url }))
          : [],
      stock_status: "instock",
      categories: productData.range ? [{ name: productData.range }] : undefined,
    };

    // Try to add the brand in multiple ways
    // Method 1: As a brand taxonomy (most common)
    formattedProductData.brands = ["Essco"];

    // Method 2: As a product attribute
    formattedProductData.attributes = [
      {
        name: "Brand",
        position: 0,
        visible: true,
        variation: false,
        options: ["Essco"],
      },
    ];

    console.log("Formatted product data:", formattedProductData);

    // Create the product
    const response = await api.post("products", formattedProductData);
    const productResponse = response.data;

    console.log("WooCommerce API response:", productResponse);

    // If the product was created but brands array is empty, try to update it
    if (
      productResponse &&
      productResponse.id &&
      (!productResponse.brands || productResponse.brands.length === 0)
    ) {
      console.log(
        "Brand not added in initial request. Trying alternative methods..."
      );

      // Try to find the correct endpoint for brands
      const possibleEndpoints = [
        "product-brands",
        "product_brands",
        "products/brands",
        "product_brand",
        "product-brand",
        "brands",
      ];

      let brandEndpoint = null;
      let brandTerms = null;

      // Try each possible endpoint
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          if (response.status === 200 && response.data) {
            console.log(`Found working endpoint: ${endpoint}`);
            brandEndpoint = endpoint;
            brandTerms = response.data;
            break;
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} not available`);
          // Continue to next endpoint
        }
      }

      // If we found a working endpoint with brand terms
      if (brandEndpoint && brandTerms) {
        console.log(
          `Found brand terms using endpoint ${brandEndpoint}:`,
          brandTerms
        );

        // Find the Essco brand
        const esscoBrand = brandTerms.find(
          (term: any) => term.name && term.name.toLowerCase() === "essco"
        );

        if (esscoBrand) {
          console.log("Found Essco brand:", esscoBrand);

          // Try to update the product with the brand
          try {
            const updateData: any = {};

            // Use the correct field name based on the endpoint
            if (brandEndpoint.includes("brand")) {
              const fieldName = brandEndpoint
                .replace(/\//g, "_")
                .replace(/-/g, "_");
              updateData[fieldName] = [esscoBrand.id];
            } else {
              updateData.brands = [esscoBrand.id];
            }

            console.log("Updating product with data:", updateData);
            const updateResponse = await api.put(
              `products/${productResponse.id}`,
              updateData
            );
            console.log("Update response:", updateResponse.data);

            return NextResponse.json(updateResponse.data);
          } catch (updateError) {
            console.error("Error updating product with brand:", updateError);
          }
        }
      }

      // If we couldn't find the brand or update failed, try one more approach
      // Try to add the brand as a tag
      try {
        console.log("Trying to add Essco as a tag");
        const tagResponse = await api.put(`products/${productResponse.id}`, {
          tags: [{ name: "Essco" }],
        });
        console.log("Tag update response:", tagResponse.data);
        return NextResponse.json(tagResponse.data);
      } catch (tagError) {
        console.error("Error adding brand as tag:", tagError);
      }
    }

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
