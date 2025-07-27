'use client';

import { useState, useRef, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { findObjectInStreams } from '@/app/actions';
import type { FindObjectOutput } from '@/ai/flows/find-object-in-streams';
import { usePersona } from '../persona/persona-provider';
import Image from 'next/image';
import { Upload, Search, X, Bot, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

export function LostAndFoundDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<FindObjectOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { getCameraFrames } = usePersona();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResults(null); // Clear previous results
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = () => {
    if (!selectedFile || !previewUrl) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload an image of the lost item to search.',
      });
      return;
    }

    startTransition(async () => {
        const cameraFeeds = await getCameraFrames();

        const input = {
            objectImageDataUri: previewUrl,
            cameraFeeds: cameraFeeds,
        };
        
        const searchResult = await findObjectInStreams(input);

        if ('error' in searchResult) {
            toast({
                variant: 'destructive',
                title: 'Search Failed',
                description: searchResult.error,
            });
            setResults(null);
        } else {
            setResults(searchResult);
            if(searchResult.findings.length === 0) {
                 toast({
                    title: 'No Matches Found',
                    description: 'The item was not found in any of the current camera frames.',
                });
            } else {
                 toast({
                    title: 'Item Found!',
                    description: `The item was spotted in ${searchResult.findings.length} camera(s).`,
                });
            }
        }
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
            <p className="text-muted-foreground">
                Upload an image of a lost item to search for it across all camera feeds.
            </p>
        </div>
         <Button onClick={handleSearch} disabled={isPending || !selectedFile}>
            <Search className="mr-2" />
            {isPending ? 'Searching...' : 'Search for Item'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>1. Upload Item Image</CardTitle>
            </CardHeader>
            <CardContent>
                <div 
                    className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {previewUrl ? (
                        <div className="relative">
                            <Image src={previewUrl} alt="Preview" width={200} height={200} className="rounded-md mx-auto" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-10 w-10" />
                            <span className="font-semibold">Click to upload image</span>
                            <span className="text-xs">PNG, JPG, or GIF</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>2. Search Results</CardTitle>
                 <CardDescription>Appearances of the lost item will be shown here.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    {isPending ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-[250px] w-full" />
                            <Skeleton className="h-[250px] w-full" />
                        </div>
                    ) : results && results.findings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.findings.map((finding, index) => (
                                <Card key={index} className="overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{finding.cameraName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative aspect-video rounded-md overflow-hidden border">
                                           <Image src={finding.frameDataUri} alt={`Found in ${finding.cameraName}`} layout="fill" objectFit="cover" />
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg border flex gap-2">
                                            <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                            <p className="text-sm italic">"{finding.reasoning}"</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20 rounded-lg p-8">
                            <ImageIcon className="h-16 w-16 mb-4" />
                            <h3 className="text-lg font-semibold">Ready to Search</h3>
                            <p className="text-sm">Upload an image and click "Search for Item" to begin.</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
