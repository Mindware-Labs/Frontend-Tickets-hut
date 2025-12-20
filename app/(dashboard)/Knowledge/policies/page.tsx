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
THE RIG HUT, LLC., A Florida limited liability company (“Company,” “we,” “us” or “THE RIG HUT”) respects your privacy and we are committed to protecting it through our compliance with this privacy policy.

This policy describes the types of information we may collect from you or that you may provide when you visit the website www.therighut.com (our “Website”) or our mobile applications (“Mobile App”) (together the Website and Mobile Apps are referred to as the “Platform”) and our practices for collecting, using, maintaining, protecting, and disclosing that information.

1. Children Under the Age of 18
THE RIG HUT does not address, and the Platform is not intended for, children under 18 years of age. No one under age 18 may provide any personal information to or on the Platform. We do not knowingly collect personal information from children under 18.

2. Information We Collect About You and How We Collect It
We collect several types of information from and about users of the Platform, including information:
- by which you may be personally identified, such as name, company name, postal address, e-mail address, telephone number...
- that is about you but individually does not identify you;
- about your internet connection, the equipment you use to access the Platform and usage details.

3. Information You Provide to Us
The information we collect on or through the Platform or other Communications may include:
- Information that you provide by filling in forms on the Platform.
- Payment and banking information.
- Records and copies of your correspondence (including email addresses).
- Your responses to surveys.

4. Information We Collect Through Automatic Data Collection Technologies
As you navigate through and interact with the Platform, we may use automatic data collection technologies to collect certain information about your equipment, browsing actions, and patterns.

( ... Full text continues as per official document ... )
`;

const TERMS_TEXT_PLACEHOLDER = `
Terms of Service content placeholder. 
Please refer to the official documentation.
`;

// --- DATA ---
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
  // Estado para controlar cuál política está expandida (ID)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredPolicies = POLICIES.filter(policy => 
    policy.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null); // Colapsar si ya está abierto
    } else {
      setExpandedId(id); // Expandir el seleccionado
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-blue-500" />
            Rig Hut Policies
          </h1>
          <p className="text-slate-400 text-sm">Documentación legal y normativas oficiales.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search policies..." 
            className="pl-9 bg-slate-900 border-slate-800 focus-visible:ring-blue-500 text-slate-200 placeholder:text-slate-600"
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
                  ? 'bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-900/10' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header de la Tarjeta (Clickeable) */}
              <div 
                onClick={() => toggleExpand(policy.id)}
                className="flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                    isExpanded ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-colors ${isExpanded ? 'text-blue-400' : 'text-slate-100'}`}>
                      {policy.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Badge variant="outline" className="text-[10px] py-0 h-4 border-slate-700 text-slate-400">
                        {policy.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Updated: {policy.updated}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {policy.status === "Mandatory" && <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Mandatory</Badge>}
                  {policy.status === "Active" && <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>}
                  
                  <div className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-slate-800 text-blue-400' : 'text-slate-500'}`}>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Contenido Expandible (Información solamente) */}
              {isExpanded && (
                <div className="border-t border-slate-800 animate-in slide-in-from-top-2 duration-200">
                  <ScrollArea className="h-[400px] w-full p-6 bg-slate-950/30">
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                      
                      {/* Título interno */}
                      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                         <Globe className="h-4 w-4 text-blue-500" />
                         <span className="font-bold text-lg text-white">{policy.title}</span>
                      </div>

                      {/* Texto del documento */}
                      {policy.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                      
                      {/* Pie de página solo informativo */}
                      <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-slate-500 italic">
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