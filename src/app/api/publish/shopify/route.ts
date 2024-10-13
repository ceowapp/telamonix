import Shopify from 'shopify-api-node'; 

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.SHOPIFY_SHOP_NAME || !process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_PASSWORD) {
      return new Response(JSON.stringify({ error: "Missing credentials" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    const shopify = new Shopify({
      shopName: process.env.SHOPIFY_SHOP_NAME,
      apiKey: process.env.SHOPIFY_API_KEY,
      password: process.env.SHOPIFY_API_PASSWORD,
    });
    const productData = await req.json();
    const shopifyData = {
      title: productData.title,
      body_html: "<strong>Good product!</strong>",
      vendor: productData.vendor || "Your Vendor Name",
      product_type: productData.category || "Type of Product",
      tags: productData.tags || "tag1, tag2",
      variants: [
        {
          option1: productData.variantOption || "Default",
          price: productData.price.toString(),
          sku: productData.sku || "123",
          inventory_quantity: productData.inventoryQuantity || 100,
        },
      ],
    };
    const product = await shopify.product.create(shopifyData);
    return new Response(JSON.stringify(product), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    let status = 500;
    let errorMessage = "An unexpected error occurred";
    let errorCode = "unknown_error";
    let errorType = "internal_server_error";

    // Handle specific error responses
    if (error.response) {
      status = error.response.status;
      errorMessage = error.response.body?.message || errorMessage; 
      errorCode = error.response.body?.code || errorCode;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Return error response
    return new Response(JSON.stringify({ 
      error: errorMessage, 
      status,
      code: errorCode,
      type: errorType
    }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}