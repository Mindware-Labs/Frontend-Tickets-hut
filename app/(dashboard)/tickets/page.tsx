"use client"

import { useState, useMemo } from "react"
import TicketFilters, { type FilterState } from "@/components/tickets/ticket-filters"
import TicketTable from "@/components/tickets/ticket-table"
import Pagination from "@/components/tickets/pagination"
import { mockTickets } from "@/lib/mock-data"

export default function TicketsPage() {
  const [filters, setFilters] = useState<FilterState>({
    campaign: "",
    status: "",
    type: "",
    dateRange: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredTickets = useMemo(() => {
    return mockTickets.filter((ticket) => {
      if (filters.campaign && ticket.campaign !== filters.campaign) return false
      if (filters.status && ticket.status !== filters.status) return false
      if (filters.type && ticket.type !== filters.type) return false
      return true
    })
  }, [filters])

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const currentTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tickets</h2>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Create Ticket
        </button>
      </div>

      <TicketFilters onFilterChange={setFilters} />

      <div className="mb-3">
        <small className="text-muted">
          Showing {currentTickets.length} of {filteredTickets.length} tickets
        </small>
      </div>

      <TicketTable tickets={currentTickets} />

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </div>
  )
}
