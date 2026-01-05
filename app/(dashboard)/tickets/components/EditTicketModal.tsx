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
import { Separator } from "@/components/ui/separator";
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
  Pencil,
  ExternalLink,
  Download,
} from "lucide-react";
import {
  AgentOption,
  CallDirection,
  CampaignOption,
  CustomerOption,
  ManagementType,
  OnboardingOption,
  ArOption,
  TicketDisposition,
  TicketPriority,
  TicketStatus,
  YardOption,
} from "../types";
import { Ticket } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface EditTicketFormData {
  customerId: string;
  customerPhone: string;
  yardId: string;
  campaignId: string;
  campaignOption: string;
  agentId: string;
  status: TicketStatus;
  priority: TicketPriority;
  direction: CallDirection;
  callDate: string;
  disposition: string;
  issueDetail: string;
  attachments: string[];
}

interface EditTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  customers: CustomerOption[];
  yards: YardOption[];
  agents: AgentOption[];
  campaigns: CampaignOption[];
  editFormData: EditTicketFormData;
  setEditFormData: (next: EditTicketFormData) => void;
  customerSearchEdit: string;
  setCustomerSearchEdit: (value: string) => void;
  yardSearchEdit: string;
  setYardSearchEdit: (value: string) => void;
  agentSearchEdit: string;
  setAgentSearchEdit: (value: string) => void;
  campaignSearchEdit: string;
  setCampaignSearchEdit: (value: string) => void;
  attachmentFiles: File[];
  setAttachmentFiles: (next: File[]) => void;
  savedAttachments: string[];
  isUpdating: boolean;
  onSubmit: () => void;
  getAttachmentLabel: (value: string) => string;
  getAttachmentUrl: (value: string) => string;
}

export function EditTicketModal({
  open,
  onOpenChange,
  ticket,
  customers,
  yards,
  agents,
  campaigns,
  editFormData,
  setEditFormData,
  customerSearchEdit,
  setCustomerSearchEdit,
  yardSearchEdit,
  setYardSearchEdit,
  agentSearchEdit,
  setAgentSearchEdit,
  campaignSearchEdit,
  setCampaignSearchEdit,
  attachmentFiles,
  setAttachmentFiles,
  savedAttachments,
  isUpdating,
  onSubmit,
  getAttachmentLabel,
  getAttachmentUrl,
}: EditTicketModalProps) {
  const formatEnumLabel = (value: string) => {
    if (value === OnboardingOption.PAID_WITH_LL) return "Paid with LL";
    return value
      .toString()
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // --- LOGIC (MEMOS) ---
  const filteredCustomersEdit = useMemo(() => {
    const term = customerSearchEdit.toLowerCase();
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(term)
    );
  }, [customers, customerSearchEdit]);

  const filteredYardsEdit = useMemo(() => {
    const term = yardSearchEdit.toLowerCase();
    return yards.filter(
      (yard) =>
        yard.name.toLowerCase().includes(term) ||
        yard.propertyAddress.toLowerCase().includes(term)
    );
  }, [yards, yardSearchEdit]);

  const filteredAgentsEdit = useMemo(() => {
    const term = agentSearchEdit.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(term) ||
        (agent.email || "").toLowerCase().includes(term)
    );
  }, [agents, agentSearchEdit]);

  const filteredCampaignsEdit = useMemo(() => {
    const term = campaignSearchEdit.toLowerCase();
    return campaigns.filter((campaign) =>
      campaign.nombre.toLowerCase().includes(term)
    );
  }, [campaigns, campaignSearchEdit]);

  const selectedCampaign = useMemo(() => {
    if (!editFormData.campaignId) return null;
    return campaigns.find(
      (campaign) => campaign.id.toString() === editFormData.campaignId
    );
  }, [campaigns, editFormData.campaignId]);

  const selectedCampaignType = selectedCampaign?.tipo?.toString().toUpperCase();
  const isOnboardingCampaign =
    selectedCampaignType === ManagementType.ONBOARDING;
  const isArCampaign = selectedCampaignType === ManagementType.AR;
  const campaignOptionValues = isOnboardingCampaign
    ? Object.values(OnboardingOption)
    : isArCampaign
    ? Object.values(ArOption)
    : [];

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/20">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Edit Ticket #{ticket.id}
          </DialogTitle>
          <DialogDescription>
            Update the ticket information below
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
                    value={editFormData.campaignId}
                    onValueChange={(value) => {
                      const campaign = campaigns.find(
                        (c) => c.id.toString() === value
                      );
                      setEditFormData({
                        ...editFormData,
                        campaignId: value === "none" ? "" : value,
                        yardId: campaign?.yardaId
                          ? campaign.yardaId.toString()
                          : "",
                        campaignOption:
                          campaign?.tipo === ManagementType.ONBOARDING ||
                          campaign?.tipo === ManagementType.AR
                            ? editFormData.campaignOption
                            : "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-background z-10 pb-2 border-b mb-1">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Search campaigns..."
                            className="pl-8 h-8 text-sm"
                            value={campaignSearchEdit}
                            onChange={(e) =>
                              setCampaignSearchEdit(e.target.value)
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
                        {filteredCampaignsEdit.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.nombre}
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
                    value={editFormData.yardId}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
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
                            value={yardSearchEdit}
                            onChange={(e) => setYardSearchEdit(e.target.value)}
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
                        {filteredYardsEdit.map((y) => (
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
                      value={editFormData.campaignOption}
                      onValueChange={(value) =>
                        setEditFormData({
                          ...editFormData,
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
                    value={editFormData.customerId}
                    onValueChange={(value) => {
                      const customer = customers.find(
                        (c) => c.id.toString() === value
                      );
                      setEditFormData({
                        ...editFormData,
                        customerId: value,
                        customerPhone: customer?.phone || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-background z-10 pb-2 border-b mb-1">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
                            className="pl-8 h-8 text-sm"
                            value={customerSearchEdit}
                            onChange={(e) =>
                              setCustomerSearchEdit(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[200px]">
                        {filteredCustomersEdit.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No results
                          </div>
                        ) : (
                          filteredCustomersEdit.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone Readonly */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Phone
                  </Label>
                  <Input
                    value={editFormData.customerPhone}
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
                    value={editFormData.agentId}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
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
                            value={agentSearchEdit}
                            onChange={(e) => setAgentSearchEdit(e.target.value)}
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
                        {filteredAgentsEdit.map((a) => (
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

            {/* SECTION 3: TICKET DETAILS */}
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
                    value={editFormData.direction}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
                        direction: value as CallDirection,
                      })
                    }
                  >
                    <SelectTrigger>
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
                    value={editFormData.status}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
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
                    value={editFormData.callDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
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
                    value={editFormData.priority}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
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
                    value={editFormData.disposition}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
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
                  placeholder="Describe the issue..."
                  value={editFormData.issueDetail}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      issueDetail: e.target.value,
                    })
                  }
                  className="min-h-[120px] resize-y"
                />
              </div>
            </div>

            {/* SECTION 4: ATTACHMENTS */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Attachments
              </h3>

              {/* Saved Attachments */}
              {savedAttachments.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold">
                    Existing Files
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAttachments.map((att, idx) => (
                      <div
                        key={`${att}-${idx}`}
                        className="flex items-center justify-between p-3 bg-muted/20 border rounded-lg hover:bg-muted/40 transition-colors group cursor-pointer"
                        onClick={() =>
                          window.open(getAttachmentUrl(att), "_blank")
                        }
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm truncate font-medium">
                            {getAttachmentLabel(att)}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Uploads */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">
                  Upload New Files
                </Label>
                <div className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-all rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer relative">
                  <Input
                    id="edit-ticket-files"
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
                      Additional files for this ticket
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
                          <Download className="w-4 h-4 text-emerald-600 shrink-0" />
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
          </div>
        </ScrollArea>

        {/* STICKY FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isUpdating} className="px-8">
            {isUpdating ? "Updating..." : "Update Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
