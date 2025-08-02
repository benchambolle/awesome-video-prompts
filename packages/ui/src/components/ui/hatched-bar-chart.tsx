"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/ui/chart";
import { Badge } from "@workspace/ui/components/ui/badge";

const chartData = [
  { month: "January", desktop: 342 },
  { month: "February", desktop: 876 },
  { month: "March", desktop: 512 },
  { month: "April", desktop: 629 },
  { month: "May", desktop: 458 },
  { month: "June", desktop: 781 },
  { month: "July", desktop: 394 },
  { month: "August", desktop: 925 },
  { month: "September", desktop: 647 },
  { month: "October", desktop: 532 },
  { month: "November", desktop: 803 },
  { month: "December", desktop: 271 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function HatchedBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Bar Chart
          <Badge
            variant="outline"
            className="text-green-500 bg-green-500/10 border-none ml-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <rect
              x="0"
              y="0"
              width="100%"
              height="85%"
              fill="url(#default-pattern-dots)"
            />
            <defs>
              <DottedBackgroundPattern />
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="desktop"
              fill="var(--color-desktop)"
              shape={<CustomHatchedBar />}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomHatchedBar = (
  props: React.SVGProps<SVGRectElement> & { dataKey?: string }
) => {
  const { fill, x, y, width, height, dataKey } = props;

  return (
    <>
      <rect
        rx={4}
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="none"
        fill={`url(#hatched-bar-pattern-${dataKey})`}
      />
      <defs>
        <pattern
          key={dataKey}
          id={`hatched-bar-pattern-${dataKey}`}
          x="0"
          y="0"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <rect width="10" height="10" opacity={0.5} fill={fill}></rect>
          <rect width="1" height="10" fill={fill}></rect>
        </pattern>
      </defs>
    </>
  );
};

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="default-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="dark:text-muted/40 text-muted"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};
