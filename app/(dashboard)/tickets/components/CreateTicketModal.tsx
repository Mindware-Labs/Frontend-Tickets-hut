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
import { Search, X } from "lucide-react";
import {
  AgentOption,
  CallDirection,
  CreateTicketFormData,
  CustomerOption,
  ManagementType,
  OnboardingOption,
  TicketDisposition,
  TicketPriority,
  TicketStatus,
  YardOption,
} from "../types";

interface CreateTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: CustomerOption[];
  yards: YardOption[];
  agents: AgentOption[];
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
  newAttachment: string;
  setNewAttachment: (value: string) => void;
  isCreating: boolean;
  onSubmit: () => void;
}

export function CreateTicketModal({
  open,
  onOpenChange,
  customers,
  yards,
  agents,
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
  newAttachment,
  setNewAttachment,
  isCreating,
  onSubmit,
}: CreateTicketModalProps) {
  const formatEnumLabel = (value: string) => {
    return value
      .toString()
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

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
        yard.commonName.toLowerCase().includes(term) ||
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Manual Ticket</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new ticket
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
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
                  className={
                    createValidationErrors.customerId ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search customers..."
                        className="pl-8"
                        value={customerSearchCreate}
                        onChange={(e) =>
                          setCustomerSearchCreate(e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    {filteredCustomersCreate.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">
                        No customers found
                      </div>
                    ) : (
                      filteredCustomersCreate.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id.toString()}
                        >
                          {customer.name}
                        </SelectItem>
                      ))
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
              {createValidationErrors.customerId && (
                <p className="text-xs text-red-500">
                  {createValidationErrors.customerId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Customer Phone</Label>
              <Input
                value={createFormData.customerPhone}
                readOnly
                placeholder="Auto-filled from customer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Yard</Label>
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
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search yards..."
                        className="pl-8"
                        value={yardSearchCreate}
                        onChange={(e) => setYardSearchCreate(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <SelectItem value="none">No yard</SelectItem>
                    {filteredYardsCreate.map((yard) => (
                      <SelectItem key={yard.id} value={yard.id.toString()}>
                        {yard.commonName || yard.name}
                      </SelectItem>
                    ))}
                    {filteredYardsCreate.length === 0 && (
                      <div className="p-3 text-sm text-muted-foreground">
                        No yards found
                      </div>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assign Agent</Label>
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
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search agents..."
                        className="pl-8"
                        value={agentSearchCreate}
                        onChange={(e) => setAgentSearchCreate(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <SelectItem value="none">Unassigned</SelectItem>
                    {filteredAgentsCreate.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">
                        No agents found
                      </div>
                    ) : (
                      filteredAgentsCreate.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                          {agent.email ? ` (${agent.email})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Campaign</Label>
              <Select
                value={createFormData.campaign}
                onValueChange={(value) =>
                  setCreateFormData({
                    ...createFormData,
                    campaign: value === "none" ? "" : value,
                    onboardingOption:
                      value === ManagementType.ONBOARDING
                        ? createFormData.onboardingOption
                        : "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No campaign</SelectItem>
                  {Object.values(ManagementType).map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {createFormData.campaign === ManagementType.ONBOARDING && (
                <div className="space-y-2 mt-6">
                  <Label>Onboarding Option</Label>
                  <Select
                    value={createFormData.onboardingOption}
                    onValueChange={(value) =>
                      setCreateFormData({
                        ...createFormData,
                        onboardingOption: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No option</SelectItem>
                      {Object.values(OnboardingOption).map((value) => (
                        <SelectItem key={value} value={value}>
                          {formatEnumLabel(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 mt-6">
                <Label>Direction *</Label>
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
                    className={
                      createValidationErrors.direction ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CallDirection).map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatEnumLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createValidationErrors.direction && (
                  <p className="text-xs text-red-500">
                    {createValidationErrors.direction}
                  </p>
                )}
              </div>

            </div>


            <div className="space-y-2">
              <Label>Status</Label>
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
                  {Object.values(TicketStatus).map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Date</Label>
            <Input
              type="date"
              value={createFormData.callDate}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  callDate: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Priority</Label>
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
                  {Object.values(TicketPriority).map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Disposition</Label>
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
                    .filter((value) => value !== "OTHER")
                    .map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatEnumLabel(value)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Issue Detail</Label>
            <Textarea
              placeholder="Describe the issue..."
              value={createFormData.issueDetail}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  issueDetail: e.target.value,
                })
              }
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <Label>Attachments</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add attachment link or name..."
                value={newAttachment}
                onChange={(e) => setNewAttachment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = newAttachment.trim();
                    if (!value) return;
                    setCreateFormData({
                      ...createFormData,
                      attachments: [...createFormData.attachments, value],
                    });
                    setNewAttachment("");
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const value = newAttachment.trim();
                  if (!value) return;
                  setCreateFormData({
                    ...createFormData,
                    attachments: [...createFormData.attachments, value],
                  });
                  setNewAttachment("");
                }}
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {createFormData.attachments.map((att, idx) => (
                <Badge
                  key={`${att}-${idx}`}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 gap-2 group"
                >
                  <span className="truncate max-w-[200px]">{att}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-transparent"
                    onClick={() => {
                      setCreateFormData({
                        ...createFormData,
                        attachments: createFormData.attachments.filter(
                          (_, i) => i !== idx
                        ),
                      });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {createFormData.attachments.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No attachments added
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
