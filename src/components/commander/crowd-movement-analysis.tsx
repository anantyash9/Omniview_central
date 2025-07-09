'use client';

import { TrendingUp } from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { usePersona } from '@/components/persona/persona-provider';

const chartConfig = {
  'North Gate': {
    label: 'North Gate',
    color: 'hsl(var(--chart-1))',
  },
  'Main Entrance': {
    label: 'Main Entrance',
    color: 'hsl(var(--chart-2))',
  },
  'South Gate': {
    label: 'South Gate',
    color: 'hsl(var(--chart-3))',
  },
};

export function CrowdMovementAnalysis() {
  const { crowdFlow } = usePersona();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crowd Movement Analysis</CardTitle>
        <CardDescription>
          Real-time analysis of people per minute (PPM) at key entry/exit points.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={crowdFlow}
            margin={{
              left: 0,
              right: 24,
              top: 5,
              bottom: 5
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 400]}
              />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="North Gate"
              type="monotone"
              stroke="var(--color-North Gate)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Main Entrance"
              type="monotone"
              stroke="var(--color-Main Entrance)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="South Gate"
              type="monotone"
              stroke="var(--color-South Gate)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this hour <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing crowd flow for the last hour
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
