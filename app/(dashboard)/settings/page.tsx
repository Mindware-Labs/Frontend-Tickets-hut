"use client"

import type React from "react"

import { useState } from "react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "Call Center Dashboard",
    emailNotifications: true,
    pushNotifications: false,
    autoAssign: true,
    defaultCampaign: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Settings saved successfully!")
  }

  return (
    <div>
      <h2 className="mb-4">Settings</h2>

      <div className="row">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            {/* General Settings */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">General Settings</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Site Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Default Campaign</label>
                  <select
                    className="form-select"
                    value={settings.defaultCampaign}
                    onChange={(e) => setSettings({ ...settings, defaultCampaign: e.target.value })}
                  >
                    <option value="">Select a campaign</option>
                    <option value="Spring Campaign 2024">Spring Campaign 2024</option>
                    <option value="Q1 Collections">Q1 Collections</option>
                    <option value="New Customer Outreach">New Customer Outreach</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Notifications</h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="emailNotifications">
                    Email Notifications
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="pushNotifications">
                    Push Notifications
                  </label>
                </div>
              </div>
            </div>

            {/* Ticket Settings */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Ticket Settings</h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="autoAssign"
                    checked={settings.autoAssign}
                    onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="autoAssign">
                    Auto-assign tickets to available agents
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              <i className="bi bi-save me-2"></i>Save Settings
            </button>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">System Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted small">Version</label>
                <p className="mb-0 fw-semibold">1.0.0</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Environment</label>
                <p className="mb-0">
                  <span className="badge bg-success">Production</span>
                </p>
              </div>
              <div className="mb-0">
                <label className="text-muted small">Last Updated</label>
                <p className="mb-0">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
