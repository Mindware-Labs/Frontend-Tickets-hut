"use client";

export interface CampaignOption {
  id: number;
  nombre: string;
}

export interface Customer {
  id: number;
  name?: string;
  phone?: string;
  campaigns?: CampaignOption[];
  createdAt: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  campaignIds: string[];
}
