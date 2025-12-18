"use client"

import { useState } from "react"
import ChartCard from "@/components/dashboard/chart-card"
import BarChart from "@/components/dashboard/bar-chart"
import LineChart from "@/components/dashboard/line-chart"
import { getTicketsByCampaign, getTicketsByType, getCallsPerDay, mockTickets } from "@/lib/mock-data"

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    campaign: "",
    type: "",
  })

  const campaignData = getTicketsByCampaign()
  const typeData = getTicketsByType()
  const callsData = getCallsPerDay()

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <i className="bi bi-file-earmark-pdf me-2"></i>Export PDF
          </button>
          <button className="btn btn-primary">
            <i className="bi bi-file-earmark-excel me-2"></i>Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Campaign</label>
              <select
                className="form-select"
                value={filters.campaign}
                onChange={(e) => setFilters({ ...filters, campaign: e.target.value })}
              >
                <option value="">All Campaigns</option>
                <option value="Spring Campaign 2024">Spring Campaign 2024</option>
                <option value="Q1 Collections">Q1 Collections</option>
                <option value="New Customer Outreach">New Customer Outreach</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Ticket Type</label>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="Onboarding">Onboarding</option>
                <option value="AR">AR</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-primary">{mockTickets.length}</h3>
              <p className="text-muted mb-0">Total Tickets</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-success">{mockTickets.filter((t) => t.status === "Closed").length}</h3>
              <p className="text-muted mb-0">Resolved</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-info">4.5</h3>
              <p className="text-muted mb-0">Avg Resolution Time (hrs)</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-warning">92%</h3>
              <p className="text-muted mb-0">Resolution Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <ChartCard title="Tickets by Campaign">
            <BarChart data={campaignData} color="#3b82f6" />
          </ChartCard>
        </div>
        <div className="col-lg-6">
          <ChartCard title="Tickets by Type">
            <BarChart data={typeData} color="#10b981" />
          </ChartCard>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <ChartCard title="Calls per Day (Last 7 Days)">
            <LineChart data={callsData} />
          </ChartCard>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0">Detailed Report</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Campaign</th>
                  <th>Total Calls</th>
                  <th>Tickets Created</th>
                  <th>Resolved</th>
                  <th>Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jan 15, 2024</td>
                  <td>Spring Campaign 2024</td>
                  <td>52</td>
                  <td>48</td>
                  <td>42</td>
                  <td>
                    <span className="badge bg-success">87.5%</span>
                  </td>
                </tr>
                <tr>
                  <td>Jan 14, 2024</td>
                  <td>Q1 Collections</td>
                  <td>48</td>
                  <td>45</td>
                  <td>40</td>
                  <td>
                    <span className="badge bg-success">88.9%</span>
                  </td>
                </tr>
                <tr>
                  <td>Jan 13, 2024</td>
                  <td>New Customer Outreach</td>
                  <td>61</td>
                  <td>58</td>
                  <td>55</td>
                  <td>
                    <span className="badge bg-success">94.8%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
