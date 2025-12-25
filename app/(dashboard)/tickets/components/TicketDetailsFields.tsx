"use client";

import { Fragment } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FieldItem = {
  key: string;
  node: JSX.Element;
};

interface TicketDetailsFieldsProps {
  filledMetadataFields: FieldItem[];
  filledFullFields: FieldItem[];
  missingMetadataFields: FieldItem[];
  missingFullFields: FieldItem[];
}

export function TicketDetailsFields({
  filledMetadataFields,
  filledFullFields,
  missingMetadataFields,
  missingFullFields,
}: TicketDetailsFieldsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Completed fields</CardTitle>
          <CardDescription>
            Information already recorded or received automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filledMetadataFields.length === 0 && filledFullFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed fields yet.
            </p>
          ) : (
            <>
              {filledMetadataFields.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {filledMetadataFields.map((field) => (
                    <Fragment key={field.key}>{field.node}</Fragment>
                  ))}
                </div>
              )}
              {filledFullFields.map((field) => (
                <div key={field.key} className="mt-4">
                  {field.node}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Missing fields</CardTitle>
          <CardDescription>Details the agent needs to complete.</CardDescription>
        </CardHeader>
        <CardContent>
          {missingMetadataFields.length === 0 && missingFullFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending fields.</p>
          ) : (
            <>
              {missingMetadataFields.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {missingMetadataFields.map((field) => (
                    <Fragment key={field.key}>{field.node}</Fragment>
                  ))}
                </div>
              )}
              {missingFullFields.map((field) => (
                <div key={field.key} className="mt-4">
                  {field.node}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
