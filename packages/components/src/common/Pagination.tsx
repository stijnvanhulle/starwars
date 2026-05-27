import MuiPagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'

export type PaginationProps = {
  page: number
  count: number
  onChange: (page: number) => void
}

/**
 * Whale-styled wrapper over MUI `Pagination`. Renders nothing when `count <= 1`.
 */
export function Pagination({ page, count, onChange }: PaginationProps) {
  if (count <= 1) return null
  return (
    <MuiPagination
      page={page}
      count={count}
      onChange={(_event, nextPage) => onChange(nextPage)}
      shape="rounded"
      color="primary"
      renderItem={(item) => (
        <PaginationItem
          {...item}
          sx={{
            borderRadius: 9999,
            fontWeight: 700,
            '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText' },
          }}
        />
      )}
    />
  )
}
