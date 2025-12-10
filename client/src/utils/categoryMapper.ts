// Category ID to Name mapping
const categoryMap: Record<string, string> = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '18': 'Short Movies',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '21': 'Videoblogging',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '30': 'Movies',
  '31': 'Anime/Animation',
  '32': 'Action/Adventure',
  '33': 'Classics',
  '34': 'Comedy',
  '35': 'Documentary',
  '36': 'Drama',
  '37': 'Family',
  '38': 'Foreign',
  '39': 'Horror',
  '40': 'Sci-Fi/Fantasy',
  '41': 'Thriller',
  '42': 'Shorts',
  '43': 'Shows',
  '44': 'Trailers'
};

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
  return Object.entries(categoryMap).map(([id, name]) => ({
    id,
    name
  }));
};

export default {
  getCategoryName,
  getAllCategories
};

