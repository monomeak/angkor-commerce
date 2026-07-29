"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv } from "../lib/csv-export";

interface ExportCsvButtonProps {
  readonly filename: string;
  readonly headers: string[];
  readonly rows: (string | number)[][];
  readonly disabled?: boolean;
}
export function ExportCsvButton({
    filename, headers, rows, disabled
}: ExportCsvButtonProps){
    const handleExport = () =>{
            downloadCsv(filename, toCsv(headers, rows))
    };

    return (<Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}
    disabled = {disabled || rows.length === 0}> 
    <Download className="size-3.5"/>
    Export CSV

    </Button>)
}