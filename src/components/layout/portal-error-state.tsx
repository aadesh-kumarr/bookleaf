"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PortalErrorState({ reset }: { reset: () => void }) {
  return (
    <Card className="mx-auto mt-12 max-w-xl">
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand-hover">
          <AlertCircle size={22} />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Unable to load this page</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
          The database or network may be temporarily unavailable. Your data is
          safe; try the request again.
        </p>
        <Button className="mt-5" onClick={reset}>
          <RefreshCw size={16} />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
