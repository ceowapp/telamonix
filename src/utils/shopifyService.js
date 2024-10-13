const Shopify = require('shopify-api-node');
const dotenv = require('dotenv');
dotenv.config();

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_PASSWORD,
});

exports.createProduct = async (productData, seoData) => {
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
  try {
    const product = await shopify.product.create(shopifyData);
    return product;
  } catch (error) {
    console.error('Error creating product:', error.response.body);
    throw new Error('Failed to create product');
  }
};