"use client"

import { useState, useEffect } from "react"
import { getDashboardStats } from "@/lib/mock-data"

export function useRealTimeSimulation() {
    const [stats, setStats] = useState(getDashboardStats())
    const [lastUpdate, setLastUpdate] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => {
                // Randomly fluctuate values slightly to simulate activity
                const factor = Math.random() > 0.5 ? 1 : -1
                const change = Math.floor(Math.random() * 2)

                return {
                    ...prev,
                    totalCalls: prev.totalCalls + (Math.random() > 0.7 ? 1 : 0),
                    ticketsCreated: prev.ticketsCreated + (Math.random() > 0.8 ? 1 : 0),
                    closedTickets: prev.closedTickets + (Math.random() > 0.9 ? 1 : 0),
                    arPayments: prev.arPayments + (Math.random() > 0.95 ? Math.floor(Math.random() * 100) : 0),
                    openTickets: Math.max(0, prev.openTickets + (Math.random() > 0.6 ? factor * change : 0))
                }
            })
            setLastUpdate(new Date())
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return { stats, lastUpdate }
}
