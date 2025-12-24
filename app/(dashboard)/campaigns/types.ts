export type CampaignType = "ONBOARDING" | "AR" | "OTHER";

export interface YardSummary {
  id: number;
  name: string;
}

export interface Campaign {
  id: number;
  nombre: string;
  yardaId?: number | null;
  yarda?: YardSummary | null;
  duracion?: string | null;
  tipo: CampaignType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ticketCount?: number;
}

export interface CampaignFormData {
  nombre: string;
  yardaId?: number;
  duracion: string;
  tipo: CampaignType;
  isActive: boolean;
}
