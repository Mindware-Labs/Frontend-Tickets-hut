"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator"; // Asegúrate de tener este componente o usa un <div className="h-[1px] bg-border" />
import {
  Search,
  X,
  User,
  Phone,
  MapPin,
  Briefcase,
  Megaphone,
  ArrowLeftRight,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  UploadCloud,
  Paperclip,
} from "lucide-react";
import {
  AgentOption,
  CallDirection,
  CampaignOption,
  CreateTicketFormData,
  CustomerOption,
  ManagementType,
  OnboardingOption,
  ArOption,
  TicketDisposition,
  TicketPriority,
  TicketStatus,
  YardOption,
} from "../types";
import { cn } from "@/lib/utils"; // Utilidad estándar de shadcn

interface CreateTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: CustomerOption[];
  yards: YardOption[];
  agents: AgentOption[];
  campaigns: CampaignOption[];
  createFormData: CreateTicketFormData;
  setCreateFormData: (next: CreateTicketFormData) => void;
  createValidationErrors: Record<string, string>;
  setCreateValidationErrors: (next: Record<string, string>) => void;
  customerSearchCreate: string;
  setCustomerSearchCreate: (value: string) => void;
  yardSearchCreate: string;
  setYardSearchCreate: (value: string) => void;
  agentSearchCreate: string;
  setAgentSearchCreate: (value: string) => void;
  campaignSearchCreate: string;
  setCampaignSearchCreate: (value: string) => void;
  newAttachment: string;
  setNewAttachment: (value: string) => void;
  attachmentFiles: File[];
  setAttachmentFiles: (next: File[]) => void;
  isCreating: boolean;
  onSubmit: () => void;
}

export function CreateTicketModal({
  open,
  onOpenChange,
  customers,
  yards,
  agents,
  campaigns,
  createFormData,
  setCreateFormData,
  createValidationErrors,
  setCreateValidationErrors,
  customerSearchCreate,
  setCustomerSearchCreate,
  yardSearchCreate,
  setYardSearchCreate,
  agentSearchCreate,
  setAgentSearchCreate,
  campaignSearchCreate,
  setCampaignSearchCreate,
  attachmentFiles,
  setAttachmentFiles,
  isCreating,
  onSubmit,
}: CreateTicketModalProps) {
  const formatEnumLabel = (value: string) => {
    if (value === OnboardingOption.PAID_WITH_LL) return "Paid with LL";
    return value
      .toString()
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // --- LOGIC (MEMOS) ---
  const filteredCustomersCreate = useMemo(() => {
    const term = customerSearchCreate.toLowerCase();
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(term)
    );
  }, [customers, customerSearchCreate]);

  const filteredYardsCreate = useMemo(() => {
    const term = yardSearchCreate.toLowerCase();
    return yards.filter(
      (yard) =>
        yard.name.toLowerCase().includes(term) ||
        yard.propertyAddress.toLowerCase().includes(term)
    );
  }, [yards, yardSearchCreate]);

  const filteredAgentsCreate = useMemo(() => {
    const term = agentSearchCreate.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(term) ||
        (agent.email || "").toLowerCase().includes(term)
    );
  }, [agents, agentSearchCreate]);

  const filteredCampaignsCreate = useMemo(() => {
    const term = campaignSearchCreate.toLowerCase();
    return campaigns.filter((campaign) =>
      campaign.nombre.toLowerCase().includes(term)
    );
  }, [campaigns, campaignSearchCreate]);

  const selectedCampaign = useMemo(() => {
    if (!createFormData.campaignId) return null;
    return campaigns.find(
      (campaign) => campaign.id.toString() === createFormData.campaignId
    );
  }, [campaigns, createFormData.campaignId]);

  const selectedCampaignType = selectedCampaign?.tipo?.toString().toUpperCase();
  const isOnboardingCampaign =
    selectedCampaignType === ManagementType.ONBOARDING;
  const isArCampaign = selectedCampaignType === ManagementType.AR;
  const campaignOptionValues = isOnboardingCampaign
    ? Object.values(OnboardingOption)
    : isArCampaign
    ? Object.values(ArOption)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/20">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Create Manual Ticket
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to generate a new support ticket.
          </DialogDescription>
        </DialogHeader>

        {/* SCROLLABLE BODY */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* SECTION 1: CAMPAIGN & YARD */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> Campaign & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  {/* Campaign */}
  <div className="space-y-2">
    <Label className="text-xs font-semibold">Campaign</Label>
    <Select
      value={createFormData.campaignId}
      onValueChange={(value) => {
        const campaign = campaigns.find(
          (c) => c.id.toString() === value
        );
        setCreateFormData({
          ...createFormData,
          campaignId: value === "none" ? "" : value,
          yardId: campaign?.yardaId
            ? campaign.yardaId.toString()
            : "",
          campaignOption:
            campaign?.tipo === ManagementType.ONBOARDING ||
            campaign?.tipo === ManagementType.AR
              ? createFormData.campaignOption
              : "",
        });
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select campaign">
          {createFormData.campaignId && createFormData.campaignId !== "none" && (
            <span 
              className="truncate block max-w-[180px]" 
              title={campaigns.find(c => c.id.toString() === createFormData.campaignId)?.nombre || createFormData.campaignId}
            >
              {campaigns.find(c => c.id.toString() === createFormData.campaignId)?.nombre || createFormData.campaignId}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 sticky top-0 bg-background z-10 pb-2 border-b mb-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-8 h-8 text-sm"
              value={campaignSearchCreate}
              onChange={(e) =>
                setCampaignSearchCreate(e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          <SelectItem
            value="none"
            className="text-muted-foreground"
          >
            No campaign
          </SelectItem>
          {filteredCampaignsCreate.map((c) => (
            <SelectItem 
              key={c.id} 
              value={c.id.toString()}
              title={c.nombre}
            >
              <span className="truncate block max-w-[250px]">
                {c.nombre}
              </span>
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  </div>

                {/* Yard Select */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Yard
                  </Label>
                  <Select
                    value={createFormData.yardId}
                    onValueChange={(value) =>
                      setCreateFormData({
                        ...createFormData,
                        yardId: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select yard" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-background z-10 pb-2 border-b mb-1">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Search yards..."
                            className="pl-8 h-8 text-sm"
                            value={yardSearchCreate}
                            onChange={(e) =>
                              setYardSearchCreate(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[200px]">
                        <SelectItem
                          value="none"
                          className="text-muted-foreground font-medium"
                        >
                          No yard
                        </SelectItem>
                        {filteredYardsCreate.map((y) => (
                          <SelectItem key={y.id} value={y.id.toString()}>
                            {y.name}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic Campaign Option */}
                {campaignOptionValues.length > 0 && (
                  <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-left-2">
                    <Label className="text-xs font-semibold">
                      Campaign Option
                    </Label>
                    <Select
                      value={createFormData.campaignOption}
                      onValueChange={(value) =>
                        setCreateFormData({
                          ...createFormData,
                          campaignOption: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No option</SelectItem>
                        {campaignOptionValues.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* SECTION 2: CUSTOMER INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Customer Select */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    Customer Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={createFormData.customerId}
                    onValueChange={(value) => {
                      const customer = customers.find(
                        (c) => c.id.toString() === value
                      );
                      setCreateFormData({
                        ...createFormData,
                        customerId: value,
                        customerPhone: customer?.phone || "",
                      });
                      setCreateValidationErrors({
                        ...createValidationErrors,
                        customerId: "",
                      });
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        createValidationErrors.customerId &&
                          "border-red-500 ring-red-500/20"
                      )}
                    >
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-background z-10 pb-2 border-b mb-1">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
                            className="pl-8 h-8 text-sm"
                            value={customerSearchCreate}
                            onChange={(e) =>
                              setCustomerSearchCreate(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[200px]">
                        {filteredCustomersCreate.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No results
                          </div>
                        ) : (
                          filteredCustomersCreate.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  {createValidationErrors.customerId && (
                    <p className="text-[11px] font-medium text-red-500 animate-in slide-in-from-top-1">
                      {createValidationErrors.customerId}
                    </p>
                  )}
                </div>

                {/* Phone Readonly */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Phone
                  </Label>
                  <Input
                    value={createFormData.customerPhone}
                    readOnly
                    placeholder="Auto-filled"
                    className="bg-muted/40 border-dashed text-muted-foreground focus-visible:ring-0 cursor-not-allowed"
                    tabIndex={-1}
                  />
                </div>

                {/* Agent Select */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Assign Agent
                  </Label>
                  <Select
                    value={createFormData.agentId}
                    onValueChange={(value) =>
                      setCreateFormData({
                        ...createFormData,
                        agentId: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-background z-10 pb-2 border-b mb-1">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Search agents..."
                            className="pl-8 h-8 text-sm"
                            value={agentSearchCreate}
                            onChange={(e) =>
                              setAgentSearchCreate(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[200px]">
                        <SelectItem
                          value="none"
                          className="text-muted-foreground"
                        >
                          Unassigned
                        </SelectItem>
                        {filteredAgentsCreate.map((a) => (
                          <SelectItem key={a.id} value={a.id.toString()}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* SECTION 3: TICKET CLASSIFICATION */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> Ticket Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Direction */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Direction <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={createFormData.direction}
                    onValueChange={(value) => {
                      setCreateFormData({
                        ...createFormData,
                        direction: value as CallDirection,
                      });
                      setCreateValidationErrors({
                        ...createValidationErrors,
                        direction: "",
                      });
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        createValidationErrors.direction && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CallDirection).map((v) => (
                        <SelectItem key={v} value={v}>
                          {formatEnumLabel(v)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Status
                  </Label>
                  <Select
                    value={createFormData.status}
                    onValueChange={(value) =>
                      setCreateFormData({
                        ...createFormData,
                        status: value as TicketStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TicketStatus).map((v) => (
                        <SelectItem key={v} value={v}>
                          {formatEnumLabel(v)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Date
                  </Label>
                  <Input
                    type="date"
                    className="block w-full"
                    value={createFormData.callDate}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        callDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* SECTION 3: PRIORITY & DISPOSITION */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Details & Resolution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Priority</Label>
                  <Select
                    value={createFormData.priority}
                    onValueChange={(value) =>
                      setCreateFormData({
                        ...createFormData,
                        priority: value as TicketPriority,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TicketPriority).map((v) => (
                        <SelectItem key={v} value={v}>
                          {formatEnumLabel(v)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Disposition
                  </Label>
                  <Select
                    value={createFormData.disposition}
                    onValueChange={(value) =>
                      setCreateFormData({
                        ...createFormData,
                        disposition: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select disposition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No disposition</SelectItem>
                      {Object.values(TicketDisposition)
                        .filter((v) => v !== "OTHER")
                        .map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold">
                  Issue Description
                </Label>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  value={createFormData.issueDetail}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      issueDetail: e.target.value,
                    })
                  }
                  className="min-h-[120px] resize-y bg-background"
                />
              </div>
            </div>

            {/* SECTION 4: ATTACHMENTS */}
            <div className="space-y-4">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                Attachments
              </Label>

              <div className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-all rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer relative">
                <Input
                  id="create-ticket-files"
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    setAttachmentFiles([...attachmentFiles, ...files]);
                    e.currentTarget.value = "";
                  }}
                />
                <div className="p-3 bg-background rounded-full shadow-sm">
                  <UploadCloud className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Click or drag files to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Support for documents, images (Max 10MB)
                  </p>
                </div>
              </div>

              {attachmentFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {attachmentFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between p-2.5 bg-muted/40 border rounded-md group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                        onClick={() =>
                          setAttachmentFiles(
                            attachmentFiles.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* STICKY FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isCreating} className="px-8">
            {isCreating ? <>Creating...</> : <>Create Ticket</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
