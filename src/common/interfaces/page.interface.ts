/**
 * Pagination metadata interface
 */
export interface PageMetaDto {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  prevLink: string | null;
  nextLink: string | null;
}

/**
 * Paginated response interface
 */
export interface PageDto<T> {
  data: T[];
  meta: PageMetaDto;
}
