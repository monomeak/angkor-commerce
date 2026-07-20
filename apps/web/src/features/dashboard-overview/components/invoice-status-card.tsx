// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatCurrency } from "../lib/format";
// import { getStatusStyle } from "../lib/invoice-status-style";
// import type { InvoiceStatusBreakdown } from "../types/dashboard";

// interface InvoiceStatusCardProps {
//   readonly data: InvoiceStatusBreakdown[];
// }

// export function InvoiceStatusCard({ data }: InvoiceStatusCardProps) {
//   return (
//     <Card className="h-full">
//       <CardHeader>
//         <CardTitle className="text-base font-semibold">
//           Invoice status
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Stacked proportion bar */}
//         <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
//           {data.map((entry) => (
//             <div
//               key={entry.status}
//               className={getStatusStyle(entry.status).dotClassName}
//               style={{ width: `${entry.percentage}%` }}
//               title={`${entry.label}: ${entry.percentage}%`}
//             />
//           ))}
//         </div>

//         {/* Legend / breakdown list */}
//         <ul className="space-y-4">
//           {data.map((entry) => {
//             const style = getStatusStyle(entry.status);
//             return (
//               <li
//                 key={entry.status}
//                 className="flex items-center justify-between text-sm"
//               >
//                 <div className="flex items-center gap-2.5">
//                   <span
//                     className={`h-2.5 w-2.5 rounded-full ${style.dotClassName}`}
//                   />
//                   <span className="text-foreground">{entry.label}</span>
//                   <span className="text-muted-foreground">({entry.count})</span>
//                 </div>
//                 <span className="font-medium">
//                   {formatCurrency(entry.amount)}
//                 </span>
//               </li>
//             );
//           })}
//         </ul>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "../lib/format";
import type { InvoiceStatusBreakdown } from "../types/dashboard";

interface InvoiceStatusCardProps {
  readonly data: InvoiceStatusBreakdown[];
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function InvoiceStatusCard({ data }: InvoiceStatusCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Invoice status
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, _name, item) => [
                  formatCurrency(Number(value)),
                  item.payload.label,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="mt-4 space-y-3">
          {data.map((entry, index) => (
            <li
              key={entry.status}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />

                <span>{entry.label}</span>

                <span className="text-muted-foreground">({entry.count})</span>
              </div>

              <div className="text-right">
                <p className="font-medium">{formatCurrency(entry.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.percentage}%
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
