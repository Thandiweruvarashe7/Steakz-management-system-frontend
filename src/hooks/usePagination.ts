import { useState } from 'react'

export function usePagination(defaultLimit = 10) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(defaultLimit)

  function goToPage(p: number) {
    setPage(Math.max(1, p))
  }

  function nextPage() {
    setPage((p) => p + 1)
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1))
  }

  function reset() {
    setPage(1)
  }

  const offset = (page - 1) * limit

  return { page, limit, offset, setPage: goToPage, setLimit, nextPage, prevPage, reset }
}
