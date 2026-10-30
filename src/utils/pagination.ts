// src/utils/pagination.ts

// Baca ?page dan ?limit (default 1 dan 10, limit maksimal 100)
// Nilai asal-asalan seperti ?page=abc atau ?limit=-5 jatuh ke nilai aman
export const getPagination = (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const buildMetadata = (page: number, limit: number, totalItems: number) => ({
  currentPage: page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});
