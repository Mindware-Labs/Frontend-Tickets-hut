'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  Globe
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

// --- TEXTO OFICIAL (Política de Privacidad Rig Hut) ---
const PRIVACY_POLICY_TEXT = `
THE RIG HUT, LLC., A Florida limited liability company ("Company," "we," "us" or "THE RIG HUT") respects your privacy and we are committed to protecting it through our compliance with this privacy policy.

This policy describes the types of information we may collect from you or that you may provide when you visit the website www.therighut.com (our "Website") or our mobile applications ("Mobile App") (together the Website and Mobile Apps are referred to as the "Platform") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
`;

const POLICIES = [
  { 
    id: 1, 
    title: "Privacy Policy", 
    category: "Legal", 
    updated: "Dec 16, 2025", 
    status: "Active",
    content: PRIVACY_POLICY_TEXT
  },
]

export default function PoliciesPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredPolicies = POLICIES.filter(policy => 
    policy.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Rig Hut Policies
          </h1>
          <p className="text-muted-foreground text-sm">Documentación legal y normativas oficiales.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search policies..." 
            className="pl-9 bg-card border-border focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Policies List (Accordion Style) */}
      <div className="grid gap-4">
        {filteredPolicies.map((policy) => {
          const isExpanded = expandedId === policy.id;

          return (
            <Card 
              key={policy.id} 
              className={`border transition-all duration-200 overflow-hidden ${
                isExpanded 
                  ? 'bg-card border-primary/50 shadow-lg shadow-primary/10' 
                  : 'bg-card/50 border-border hover:border-muted-foreground/30'
              }`}
            >
              {/* Header de la Tarjeta (Clickeable) */}
              <div 
                onClick={() => toggleExpand(policy.id)}
                className="flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                    isExpanded ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-colors ${isExpanded ? 'text-primary' : 'text-foreground'}`}>
                      {policy.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-[10px] py-0 h-4 border-muted text-muted-foreground">
                        {policy.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Updated: {policy.updated}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {policy.status === "Mandatory" && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">
                      Mandatory
                    </Badge>
                  )}
                  {policy.status === "Active" && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400">
                      Active
                    </Badge>
                  )}
                  
                  <div className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Contenido Expandible */}
              {isExpanded && (
                <div className="border-t border-border animate-in slide-in-from-top-2 duration-200">
                  <ScrollArea className="h-[400px] w-full p-6 bg-background/50">
                    <div className="prose prose-invert prose-sm max-w-none text-foreground">
                      
                      {/* Título interno */}
                      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                         <Globe className="h-4 w-4 text-primary" />
                         <span className="font-bold text-lg text-foreground">{policy.title}</span>
                      </div>

                      {/* Texto del documento */}
                      {policy.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 leading-relaxed text-foreground/90">
                          {paragraph}
                        </p>
                      ))}
                      
                      {/* Pie de página */}
                      <div className="mt-8 pt-8 border-t border-border text-xs text-muted-foreground italic">
                        <p>This document is for informational purposes only. Last revision: {policy.updated}</p>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}