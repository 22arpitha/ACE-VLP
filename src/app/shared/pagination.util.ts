
export interface PaginationParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
}

export function buildPaginationQuery({ page, pageSize, searchTerm }: PaginationParams): string {
  let query = `?page=${page}&page_size=${pageSize}`;
  if (searchTerm?.trim()) {
    // query += `&search=${searchTerm.trim()}`;
    query += searchTerm?.trim().length >= 2 ? `&search=${encodeURIComponent(searchTerm.trim())}` : '';
  }
  return query;
}
