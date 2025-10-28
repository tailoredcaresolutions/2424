import React from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  className?: string;
}

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = ''
}: TableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--tcs-gold)]"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10">
        <div className="text-center">
          <p className="text-xl text-white/60">📭</p>
          <p className="text-white/60 mt-2">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-3xl border border-[#F1E0CC] shadow-[0_30px_80px_rgba(12,8,4,0.08)] bg-white/95 backdrop-blur ${className}`}>
      <table className="min-w-full divide-y divide-[#F1E0CC]">
        <thead className="bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={`px-6 py-4 text-${column.align || 'left'} text-xs font-bold text-[#2C1301] uppercase tracking-wider`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-transparent divide-y divide-[#F5E3CB]">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'hover:bg-[#FFF0D7] cursor-pointer transition-colors' : ''} ${
                rowIndex % 2 === 0 ? 'bg-[#FFFDF8]' : 'bg-[#FFF7EB]'
              }`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-[#1F1B16] text-${column.align || 'left'}`}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(p =>
    p === 1 ||
    p === totalPages ||
    (p >= currentPage - 1 && p <= currentPage + 1)
  );

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/90 border-t border-[#F1E0CC] rounded-b-3xl">
      <div className="text-sm text-[#5C4C3C]">
        {totalItems && itemsPerPage && (
          <span>
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium text-[#1F1B16] bg-white border border-[#E9D5BF] rounded-full hover:bg-[#FFF4E1] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {showPages.map((page, index) => {
          if (index > 0 && showPages[index - 1] !== page - 1) {
            return (
              <React.Fragment key={`ellipsis-${page}`}>
                <span className="px-2 text-[#C4B6A3]">...</span>
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] text-[#2C1301]'
                      : 'text-[#1F1B16] bg-white border border-[#E9D5BF] hover:bg-[#FFF4E1]'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                currentPage === page
                  ? 'bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] text-[#2C1301]'
                  : 'text-[#1F1B16] bg-white border border-[#E9D5BF] hover:bg-[#FFF4E1]'
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm font-medium text-[#1F1B16] bg-white border border-[#E9D5BF] rounded-full hover:bg-[#FFF4E1] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
