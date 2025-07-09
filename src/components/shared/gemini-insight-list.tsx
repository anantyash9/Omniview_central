'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateIncidentSuggestions } from '@/app/actions';
import type { GenerateIncidentSuggestionsOutput } from '@/ai/flows/generate-incident-suggestions';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Bot, Lightbulb, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  incidentDescription: z.string().min(10, "Description must be at least 10 characters."),
  crowdDensity: z.string().min(1, "Please provide crowd density information."),
  availableResources: z.string().min(5, "Please list available resources."),
});

type FormValues = z.infer<typeof formSchema>;

export function GeminiInsightList() {
  const [suggestions, setSuggestions] = useState<GenerateIncidentSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incidentDescription: "",
      crowdDensity: "High in Sector 4, low elsewhere.",
      availableResources: "3 security teams, 1 medical unit, 2 patrol vehicles.",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setSuggestions(null);
    const result = await generateIncidentSuggestions(values);
    setIsLoading(false);

    if ('error' in result) {
      toast({
        variant: "destructive",
        title: "Error Generating Suggestions",
        description: result.error,
      });
    } else {
      setSuggestions(result);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-primary" /> AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="incidentDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the incident..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="crowdDensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crowd Density</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., High in Sector 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableResources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Resources</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3 teams, 1 medical unit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Suggestions'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 space-y-4">
          {isLoading && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          )}
          {suggestions && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="text-accent" /> Recommendations</h4>
              <ul className="space-y-4">
                {suggestions.suggestions.map((suggestion, index) => (
                  <li key={index} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm">{suggestion}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Impact Score: {suggestions.impactScores[index]}</span>
                    </div>
                    <Progress value={suggestions.impactScores[index]} className="h-2 mt-1" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
