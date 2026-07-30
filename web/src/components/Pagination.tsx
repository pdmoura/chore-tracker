import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export function Pagination({
  page,
  pageCount,
  onPageChange,
  itemLabel,
  firstItem,
  lastItem,
  totalItems,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  itemLabel: string;
  firstItem: number;
  lastItem: number;
  totalItems: number;
}) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {firstItem} to {lastItem} of {totalItems} {itemLabel}
      </span>
      <nav className="flex items-center gap-2" aria-label={`${itemLabel} pages`}>
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? 'default' : 'outline'}
              size="icon"
              aria-label={`Page ${pageNumber}`}
              aria-current={pageNumber === page ? 'page' : undefined}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </nav>
    </div>
  );
}
