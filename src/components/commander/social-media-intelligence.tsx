'use client';

import { useEffect, useState, useRef } from 'react';
import { usePersona } from '@/components/persona/persona-provider';
import { summarizeSocialMedia } from '@/app/actions';
import type { SummarizeSocialMediaOutput } from '@/ai/flows/summarize-social-media';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, ThumbsUp, ThumbsDown, Megaphone, MessageSquareQuote } from 'lucide-react';

const sentimentConfig = {
    Positive: { icon: <ThumbsUp className="h-5 w-5 text-green-500" />, color: 'bg-green-100 text-green-800' },
    Negative: { icon: <ThumbsDown className="h-5 w-5 text-red-500" />, color: 'bg-red-100 text-red-800' },
    Neutral: { icon: <MessageSquareQuote className="h-5 w-5 text-gray-500" />, color: 'bg-gray-100 text-gray-800' },
    Mixed: { icon: <Megaphone className="h-5 w-5 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800' },
};

export function SocialMediaIntelligence() {
  const { socialMediaPosts } = usePersona();
  const [analysis, setAnalysis] = useState<SummarizeSocialMediaOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastAnalyzedCount = useRef(0);

  useEffect(() => {
    const analyzePosts = async () => {
      if (socialMediaPosts.length > 0 && socialMediaPosts.length > lastAnalyzedCount.current) {
        setIsLoading(true);
        lastAnalyzedCount.current = socialMediaPosts.length;
        const result = await summarizeSocialMedia({ posts: socialMediaPosts });
        if (!('error' in result)) {
          setAnalysis(result);
        }
        setIsLoading(false);
      } else if (socialMediaPosts.length === 0) {
        setAnalysis(null);
        lastAnalyzedCount.current = 0;
      }
    };

    const timer = setTimeout(analyzePosts, 2000); // Debounce to avoid rapid calls
    return () => clearTimeout(timer);
  }, [socialMediaPosts]);

  const OverallSentiment = analysis ? sentimentConfig[analysis.overallSentiment] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot className="text-primary" />
            Social Media Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !analysis && (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )}
        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Overall Sentiment:</h3>
                {OverallSentiment && (
                    <Badge variant="outline" className={`text-base px-4 py-1 flex items-center gap-2 ${OverallSentiment.color}`}>
                        {OverallSentiment.icon}
                        {analysis.overallSentiment}
                    </Badge>
                )}
            </div>

            <Accordion type="single" collapsible className="w-full">
              {analysis.trendingTopics.map((item, index) => {
                 const TopicSentiment = sentimentConfig[item.sentiment];
                 return (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                {TopicSentiment.icon}
                                <span className="font-semibold">{item.topic}</span>
                                <Badge variant="secondary">{item.postCount} posts</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 pl-2">
                            <p className="text-sm">{item.summary}</p>
                            <div className="p-3 bg-muted/50 rounded-lg border">
                               <p className="text-xs text-muted-foreground font-medium">REPRESENTATIVE POST</p>
                               <p className="text-sm italic">"{item.representativePost}"</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                 );
              })}
            </Accordion>
            {analysis.trendingTopics.length === 0 && !isLoading && (
                <p className="text-muted-foreground">No significant trends identified from social media yet.</p>
            )}
          </div>
        )}
         {!isLoading && !analysis && (
            <p className="text-muted-foreground">Monitoring social media for posts from the event...</p>
        )}
      </CardContent>
    </Card>
  );
}
