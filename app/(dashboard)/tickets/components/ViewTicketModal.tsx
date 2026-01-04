"use client";

import { JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Hash,
  User,
  Phone,
  Mail,
  MapPin,
  Download,
  FileText,
  Edit2,
  Calendar,
  AlertCircle,
  ArrowRightCircle,
  Tag,
  MessageSquare,
} from "lucide-react";
import { Ticket } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type HelperFn<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => ReturnType<T>;

interface ViewTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  savedAttachments: string[];
  onEdit: () => void;
  formatEnumLabel: HelperFn<(value?: string) => string>;
  getStatusBadgeColor: HelperFn<(status: string) => string>;
  getPriorityColor: HelperFn<(priority?: string) => string>;
  getDirectionIcon: HelperFn<(direction: string) => JSX.Element>;
  getDirectionText: HelperFn<(direction: string) => string>;
  getCampaign: HelperFn<(ticket: Ticket) => string | null>;
  getAttachmentUrl: HelperFn<(value: string) => string>;
  getAttachmentLabel: HelperFn<(value: string) => string>;
  getClientName: HelperFn<(ticket: any) => string>;
  getClientPhone: HelperFn<(ticket: any) => string>;
  getYardDisplayName: HelperFn<(ticket: Ticket) => string | null>;
}

const DetailRow = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: any;
  label: string;
  value?: React.ReactNode;
  className?: string;
}) => {
  if (!value) return null;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="mt-0.5 p-1.5 bg-muted rounded-md text-muted-foreground shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground break-words">
          {value}
        </div>
      </div>
    </div>
  );
};

export function ViewTicketModal({
  open,
  onOpenChange,
  ticket,
  savedAttachments,
  onEdit,
  formatEnumLabel,
  getStatusBadgeColor,
  getPriorityColor,
  getDirectionIcon,
  getDirectionText,
  getCampaign,
  getAttachmentUrl,
  getAttachmentLabel,
  getClientName,
  getClientPhone,
  getYardDisplayName,
}: ViewTicketModalProps) {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden bg-background border-border shadow-xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-muted/20 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            {" "}
            {/* gap-4 -> gap-6 */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
                <Hash className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Ticket #{ticket.id}
                </DialogTitle>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "w-fit px-3 py-1 text-xs font-semibold uppercase shadow-none border-0 self-start sm:self-center mr-2", // Añadido mr-2
                getStatusBadgeColor(ticket.status || "")
              )}
            >
              {formatEnumLabel(ticket.status as any)}
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-8">
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Customer & Location */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Customer Details
                  </h4>
                  <div className="grid gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <DetailRow
                      icon={User}
                      label="Name"
                      value={getClientName(ticket)}
                    />
                    <Separator className="opacity-50" />
                    <DetailRow
                      icon={Phone}
                      label="Phone"
                      value={getClientPhone(ticket)}
                    />
                    {ticket.customer?.email && (
                      <>
                        <Separator className="opacity-50" />
                        <DetailRow
                          icon={Mail}
                          label="Email"
                          value={ticket.customer.email}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </h4>
                  <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <DetailRow
                      icon={MapPin}
                      label="Yard"
                      value={getYardDisplayName(ticket) || "No yard assigned"}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Ticket Context */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Ticket Context
                  </h4>
                  <div className="grid gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <DetailRow
                        icon={AlertCircle}
                        label="Priority"
                        value={
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-1",
                              getPriorityColor(ticket.priority as any)
                            )}
                          >
                            {formatEnumLabel(ticket.priority as any)}
                          </Badge>
                        }
                      />
                      <DetailRow
                        icon={ArrowRightCircle}
                        label="Direction"
                        value={
                          <div className="flex items-center gap-1.5 mt-1">
                            {getDirectionIcon(ticket.direction || "inbound")}
                            <span>
                              {getDirectionText(ticket.direction || "inbound")}
                            </span>
                          </div>
                        }
                      />
                    </div>

                    <Separator className="opacity-50" />

                    <DetailRow
                      icon={Tag}
                      label="Campaign"
                      value={getCampaign(ticket) || "No campaign"}
                    />

                    {(ticket.campaignOption ||
                      (ticket as any).onboardingOption) && (
                      <>
                        <Separator className="opacity-50" />
                        <DetailRow
                          icon={Tag}
                          label="Campaign Option"
                          value={formatEnumLabel(
                            (ticket.campaignOption ||
                              (ticket as any).onboardingOption) as any
                          )}
                        />
                      </>
                    )}

                    <Separator className="opacity-50" />

                    <DetailRow
                      icon={MessageSquare}
                      label="Disposition"
                      value={
                        ticket.disposition
                          ? formatEnumLabel(ticket.disposition as any)
                          : "-"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width: Issue & Attachments */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Issue Description
                </h4>
                <div className="p-4 rounded-lg border bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap">
                  {ticket.issueDetail || "No details provided."}
                </div>
              </div>

              {savedAttachments.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" /> Attachments
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedAttachments.map((att, idx) => (
                      <div
                        key={`${att}-${idx}`}
                        className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium truncate">
                            {getAttachmentLabel(att)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            window.open(getAttachmentUrl(att), "_blank")
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onEdit} className="gap-2 shadow-sm">
            <Edit2 className="h-4 w-4" />
            Edit Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
