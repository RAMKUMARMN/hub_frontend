type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex gap-2 items-center">
      <button
        className="btn-cixio"
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(currentPage - 1)
        }
      >
        Prev
      </button>

      <span>
        {currentPage} / {totalPages}
      </span>

      <button
        className="btn-cixio"
        disabled={currentPage === totalPages}
        onClick={() =>
          onPageChange(currentPage + 1)
        }
      >
        Next
      </button>
    </div>
  );
}