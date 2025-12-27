"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchFromBackend } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Campaign, CampaignType } from "../types";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Tag,
  Timer,
} from "lucide-react";

const campaignTypeLabels: Record<CampaignType, string> = {
  ONBOARDING: "Onboarding",
  AR: "AR",
  OTHER: "Other",
};

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const data = await fetchFromBackend(`/campaign/${params.id}`);
        setCampaign(data);
      } catch (error) {
        console.error("Error loading campaign:", error);
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchCampaign();
    }
  }, [params]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading campaign...</div>;
  }

  if (!campaign) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
        <Link href="/campaigns">
          <Button variant="outline">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/campaigns" className="text-sm text-muted-foreground">
            Back to Campaigns
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{campaign.nombre}</h2>
              <p className="text-xs text-muted-foreground">ID #{campaign.id}</p>
            </div>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={
            campaign.isActive
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
              : "border border-amber-500/20 bg-amber-500/10 text-amber-700"
          }
        >
          {campaign.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle>Campaign Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Type</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">
                    {campaignTypeLabels[campaign.tipo]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {campaign.tipo}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Yard</p>
                <div className="mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {campaign.yarda?.name || "No yard"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Duration</p>
              <div className="mt-2 flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{campaign.duracion || "N/A"}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Created</p>
                <div className="mt-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {new Date(campaign.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Updated</p>
                <div className="mt-2 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {new Date(campaign.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="border-b">
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-3">
                <div
                  className={
                    campaign.isActive
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"
                      : "flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600"
                  }
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Campaign status
                  </p>
                  <p className="font-medium">
                    {campaign.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Total Tickets</p>
              <p className="mt-2 text-2xl font-bold">
                {campaign.ticketCount ?? 0}
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Yard ID</p>
              <p className="mt-2 font-medium">
                {campaign.yardaId ?? "Not assigned"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
