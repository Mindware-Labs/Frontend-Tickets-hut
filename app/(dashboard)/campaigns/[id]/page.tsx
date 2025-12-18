"use client"

import { mockCampaigns, mockTickets } from "@/lib/mock-data"
import { notFound } from "next/navigation"
import Link from "next/link"
import TicketTable from "@/components/tickets/ticket-table"

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params
  const campaign = mockCampaigns.find((c) => c.id === id)

  if (!campaign) {
    notFound()
  }

  const campaignTickets = mockTickets.filter((t) => t.campaign === campaign.name)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link href="/campaigns" className="text-decoration-none text-muted mb-2 d-block">
            <i className="bi bi-arrow-left me-2"></i>Back to Campaigns
          </Link>
          <h2>{campaign.name}</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary">
            <i className="bi bi-pencil me-2"></i>Edit
          </button>
          <button className="btn btn-primary">
            <i className="bi bi-download me-2"></i>Export
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-primary">{campaign.ticketCount}</h3>
              <p className="text-muted mb-0">Total Tickets</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-info">{campaignTickets.filter((t) => t.status === "Open").length}</h3>
              <p className="text-muted mb-0">Open</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-warning">{campaignTickets.filter((t) => t.status === "In Progress").length}</h3>
              <p className="text-muted mb-0">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-success">{campaignTickets.filter((t) => t.status === "Closed").length}</h3>
              <p className="text-muted mb-0">Closed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Campaign Details</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="text-muted small">Campaign ID</label>
              <p className="mb-0 fw-semibold">{campaign.id}</p>
            </div>
            <div className="col-md-4 mb-3">
              <label className="text-muted small">Status</label>
              <div>
                <span
                  className={`badge ${
                    campaign.status === "Active"
                      ? "bg-success"
                      : campaign.status === "Paused"
                        ? "bg-warning"
                        : "bg-secondary"
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="text-muted small">Start Date</label>
              <p className="mb-0">{new Date(campaign.startDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0">Campaign Tickets</h5>
        </div>
        <div className="card-body p-0">
          <TicketTable tickets={campaignTickets} />
        </div>
      </div>
    </div>
  )
}
