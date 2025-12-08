/**
 * Định nghĩa format response chuẩn cho API/Server Actions
 * 
 * Pattern này giúp:
 * 1. Nhất quán trong cách return data
 * 2. Dễ handle errors ở client
 * 3. TypeScript hiểu rõ structure của response
 */

// Response thành công
export type SuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};

// Response lỗi
export type ErrorResponse = {
    success: false;
    error: string;
    code?: string; // Error code để localize message
};

// Union type cho cả 2 trường hợp
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Pagination metadata
 */
export type PaginationMeta = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

/**
 * Paginated response
 */
export type PaginatedResponse<T> = SuccessResponse<T> & {
    pagination: PaginationMeta;
};

/**
 * Helper type để unwrap data từ ApiResponse
 * 
 * Ví dụ:
 * type UserData = UnwrapApiData<ApiResponse<User>>; // -> User
 */
export type UnwrapApiData<T> = T extends SuccessResponse<infer U> ? U : never;
