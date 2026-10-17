import {
  deleteStoreImage,
  saveProductDocument,
  saveStoreImage,
} from "./wgrywanie";

export async function saveBlogImage(file: File) {
  return saveStoreImage("blog", file);
}

export async function deleteBlogImage(url: string): Promise<void> {
  return deleteStoreImage(url);
}

export async function saveProductImage(file: File) {
  return saveStoreImage("products", file);
}

export async function saveProductFile(file: File) {
  return saveProductDocument(file);
}

export async function deleteProductImage(url: string): Promise<void> {
  return deleteStoreImage(url);
}

export async function saveFabricImage(file: File) {
  return saveStoreImage("fabrics", file);
}

export async function deleteFabricImage(url: string): Promise<void> {
  return deleteStoreImage(url);
}
