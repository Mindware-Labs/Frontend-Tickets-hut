"use client"

import { useState } from "react"

interface TicketFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  campaign: string
  status: string
  type: string
  dateRange: string
}

export default function TicketFilters({ onFilterChange }: TicketFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    campaign: "",
    status: "",
    type: "",
    dateRange: "",
  })

  const handleChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Campaign</label>
            <select
              className="form-select"
              value={filters.campaign}
              onChange={(e) => handleChange("campaign", e.target.value)}
            >
              <option value="">All Campaigns</option>
              <option value="Spring Campaign 2024">Spring Campaign 2024</option>
              <option value="Q1 Collections">Q1 Collections</option>
              <option value="New Customer Outreach">New Customer Outreach</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Type</label>
            <select className="form-select" value={filters.type} onChange={(e) => handleChange("type", e.target.value)}>
              <option value="">All Types</option>
              <option value="Onboarding">Onboarding</option>
              <option value="AR">AR</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Date Range</label>
            <select
              className="form-select"
              value={filters.dateRange}
              onChange={(e) => handleChange("dateRange", e.target.value)}
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
