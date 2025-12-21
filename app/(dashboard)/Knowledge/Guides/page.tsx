'use client';

import React from 'react';
import { 
  BookOpen, 
  Download, 
  Eye, 
  FileBox, 
  Headphones 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Data para las guías solicitadas
const GUIDES = [
  {
    id: 1,
    title: "Employee Handbook 2025",
    description: "Guía completa de recursos humanos, beneficios y código de vestimenta.",
    type: "PDF",
    size: "4.5 MB",
    icon: FileBox
  },
  {
    id: 2,
    title: "Aircall Integration Guide",
    description: "Instrucciones paso a paso para configurar y usar Aircall con el CRM.",
    type: "Handbook",
    size: "Online View",
    icon: Headphones
  },
  {
    id: 3,
    title: "Discord Communication Protocols",
    description: "Reglas para el envío de tickets y actualizaciones vía Discord.",
    type: "PDF",
    size: "1.2 MB",
    icon: BookOpen
  },
  {
    id: 4,
    title: "Ticket Resolution Flowchart",
    description: "Diagrama de flujo para resolver casos de AR y Onboarding.",
    type: "Image",
    size: "2.8 MB",
    icon: FileBox
  }
];

export default function GuidesPage() {
  const handleDownload = (title: string) => {
    alert(`Downloading ${title}...`); // Aquí iría la lógica real de descarga
  };

  const handleView = (title: string) => {
    alert(`Opening viewer for ${title}...`); // Aquí se abriría el modal o nueva pestaña
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Operational Guides
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Handbooks, tutoriales e instrucciones operativas para agentes.
        </p>
      </div>

      {/* Grid de Guías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GUIDES.map((guide) => (
          <Card key={guide.id} className="bg-card border-border hover:border-primary/50 transition-all group">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
              <div className="p-2 rounded-lg bg-muted text-primary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <guide.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base text-foreground leading-tight">
                  {guide.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {guide.type} • {guide.size}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {guide.description}
              </p>
            </CardContent>

            <CardFooter className="flex gap-2 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => handleView(guide.title)}
              >
                <Eye className="h-4 w-4 mr-2" /> View
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleDownload(guide.title)}
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}