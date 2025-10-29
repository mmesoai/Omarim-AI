
'use server';
/**
 * @fileOverview A server-side service for interacting with the Shopify API.
 * This service uses API credentials from environment variables to perform actions.
 */

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  variants: {
    price: string;
    inventory_quantity: number;
  }[];
  images: {
    src: string;
  }[];
}

/**
 * Fetches products from a Shopify store.
 * @returns {Promise<{success: boolean, products: any[] | null, message: string}>} - The result of the operation.
 */
export async function fetchShopifyProducts(): Promise<{ success: boolean; products: any[] | null; message: string }> {
  const storeUrl = process.env.SHOPIFY_STORE_URL;
  const apiKey = process.env.SHOPIFY_API_KEY;

  if (!storeUrl || !apiKey) {
    console.warn("Shopify environment variables (SHOPIFY_STORE_URL, SHOPIFY_API_KEY) are not set.");
    return { success: false, products: null, message: "Shopify integration is not configured." };
  }

  try {
    const response = await fetch(`${storeUrl}/admin/api/2023-10/products.json`, {
      headers: {
        'X-Shopify-Access-Token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Shopify data into the app's product format
    const transformedProducts = data.products.map((p: ShopifyProduct) => ({
        name: p.title,
        description: p.body_html,
        price: parseFloat(p.variants[0]?.price || '0'),
        quantity: p.variants[0]?.inventory_quantity || 0,
        source: 'Shopify',
        imageId: p.images[0]?.src || '', // In a real app, you'd map this better
    }));

    return { success: true, products: transformedProducts, message: "Successfully fetched products from Shopify." };

  } catch (error: any) {
    console.error("Error fetching from Shopify:", error);
    return { success: false, products: null, message: `Failed to fetch products: ${error.message}` };
  }
}
