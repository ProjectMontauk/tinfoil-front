import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ConnectButton } from "thirdweb/react";
import { client } from "../lib/client";

export default function HomePage() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Prefetch markets data when homepage mounts
    queryClient.prefetchQuery({
      queryKey: ['markets'],
      queryFn: async () => {
        const response = await fetch('/api/markets');
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      }
    });
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Tinfoil</h2>
              <p className="text-sm text-muted-foreground">Time Discovers Truth</p>
            </div>
            <div className="flex items-center gap-4">
              <ConnectButton 
                client={client} 
                connectButton={{
                  label: "Connect Wallet",
                  className: "!bg-primary !text-white hover:!bg-primary/90 !px-4 !py-1.5 !rounded-md !font-medium !h-10"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to Tinfoil</h1>
            <p className="text-xl text-muted-foreground">
              A home for honest debate about anything on the internet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prediction Markets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Make predictions and earn rewards by contributing to collective knowledge.</p>
                <Link href="/markets">
                  <Button className="w-full">View Prediction Markets</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create New Market
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Start your own prediction market and let the crowd discover the truth.</p>
                <Link href="/markets/create">
                  <Button variant="secondary" className="w-full">Create Market</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}