'use client'

import React from 'react'
import ReactPaginate from 'react-paginate'

interface Props {
  pageCount: number
  onPageChange: (selected: number) => void
  forcePage?: number
}

const HandlePagination: React.FC<Props> = ({ pageCount, onPageChange, forcePage }) => {
  return (
    <ReactPaginate
      previousLabel="<"
      nextLabel=">"
      pageCount={pageCount}
      pageRangeDisplayed={3}
      marginPagesDisplayed={2}
      onPageChange={(selectedItem) => onPageChange(selectedItem.selected)}
      containerClassName={'pagination'}
      activeClassName={'active'}
      forcePage={forcePage}  // ✅ aquí ya existe
    />
  )
}

export default HandlePagination