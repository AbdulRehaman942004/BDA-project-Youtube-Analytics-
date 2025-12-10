import * as fs from 'fs';
import * as path from 'path';

// Load categories data
// When compiled, __dirname will be dist/utils
// In Docker: data is mounted at /app/data
// Locally: data is at ../../../data from dist/utils
const categoriesPath = process.env.NODE_ENV === 'production' && fs.existsSync('/app/data/categories.json')
  ? '/app/data/categories.json'
  : path.join(__dirname, '../../../data/categories.json');
let categoriesData: any;
try {
  categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
} catch (error) {
  console.error('Error loading categories.json:', error);
  categoriesData = { items: [] };
}

// Create a map of category ID to name
const categoryMap: Record<string, string> = {};

if (categoriesData && categoriesData.items) {
  categoriesData.items.forEach((item: any) => {
    categoryMap[item.id] = item.snippet.title;
  });
}

/**
 * Get category name by ID
 * @param categoryId - The category ID (e.g., "22", "25")
 * @returns The category name (e.g., "People & Blogs", "News & Politics") or "Unknown" if not found
 */
export const getCategoryName = (categoryId: string | number | null | undefined): string => {
  if (!categoryId) return 'Unknown';
  const id = String(categoryId);
  return categoryMap[id] || `Category ${id}`;
};

/**
 * Get all categories as an array of {id, name} objects
 */
export const getAllCategories = (): Array<{ id: string; name: string }> => {
  return categoriesData.items.map((item: any) => ({
    id: item.id,
    name: item.snippet.title
  }));
};

/**
 * Add category name to category stats objects
 */
export const enrichCategoryStats = (stats: Array<{ _id: string; count: number }>): Array<{ id: string; name: string; count: number }> => {
  return stats.map(stat => ({
    id: stat._id,
    name: getCategoryName(stat._id),
    count: stat.count
  }));
};

export default {
  getCategoryName,
  getAllCategories,
  enrichCategoryStats
};

