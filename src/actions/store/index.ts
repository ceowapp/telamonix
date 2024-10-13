"use server";
import { client } from '@/lib/prisma'
import { PRODUCT } from '@/types/product'

export async function registerProduct(data: PRODUCT) {
  try {
    const registeredProduct = await client.product.create({
      data: data,
    });
    return registeredProduct.id;
  } catch (error) {
    console.error('Error registering product:', error);
    return null;
  }
}

export async function updateProduct(id: string, data: PRODUCT) {
  try {
    const existingProduct = await client.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new Error(`product with ID ${id} not found.`);
    }

    const updatedproduct = await client.product.update({
      where: { id },
      data,
    });

    return updatedproduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function getProductsByUserEmail(email: string) {
  try {
    const user = await client.user.findUnique({
      where: { email },
      include: { products: true },
    });

    if (!user) {
      console.error('User not found');
      return [];
    }
    return user.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return []; 
  }
}
export async function getProductIdByName(productName: string) {
  try {
    const product = await client.product.findFirst({
      where: {
        title: productName,
      },
    });
    return product.id;
  } catch (error) {
    console.error(`Error fetching features for productId ${productId}:`, error);
    return null; 
  }
}

export async function removeProduct(id: string) {
  try {
    const existingProduct = await client.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found.`);
    }
    await client.product.delete({
      where: { id },
    });
    return existingProduct.id;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    return null; 
  }
}

