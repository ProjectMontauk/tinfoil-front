import React from 'react';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Home, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { z } from "zod";
import { ConnectButton } from "thirdweb/react";
import { client } from "../lib/client";

type MarketFormData = {
  title: string;
  yesResolution: string;
  noResolution: string;
};

const steps = [
  {
    title: "Market Question",
    description: "What question would you like the market to predict?",
  },
  {
    title: "Resolution Conditions",
    description: "Define how the market will be resolved",
  },
  {
    title: "Review & Submit",
    description: "Review market details before creation",
  },
  {
    title: "Market Created Successfully!",
    description: "Your market has been submitted. Choose where you'd like to go next:",
  }
];

const RefreshingLink = ({ href, children, className }: { href: string; children: React.ReactNode; className: string }) => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // First invalidate the query
      await queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      
      // Then force an immediate refetch and wait for it
      await queryClient.fetchQuery({ 
        queryKey: ['/api/markets'],
        queryFn: () => fetch('/api/markets').then(res => res.json())
      });

      // Only navigate after the fetch is complete
      navigate(href);
    } catch (error) {
      console.error('Failed to refresh markets:', error);
      // Navigate anyway if refresh fails
      navigate(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default function CreateMarketPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMarketId, setCreatedMarketId] = useState<string | null>(null);

  const form = useForm<MarketFormData>({
    defaultValues: {
      title: "",
      yesResolution: "",
      noResolution: "",
    },
  });

  const nextStep = () => {
    if (currentStep === 0 && !form.getValues("title")) {
      toast({
        title: "Required Field",
        description: "Please enter a market question",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 1 && (!form.getValues("yesResolution") || !form.getValues("noResolution"))) {
      toast({
        title: "Required Fields",
        description: "Please enter both resolution conditions",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(current => current + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(current => current - 1);
    }
  };

  // Render different form content based on step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Label htmlFor="title">Market Question</Label>
            <Input
              id="title"
              placeholder="Was Atlantis a real place?"
              {...form.register("title", { required: true })}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="yesResolution">"Yes" Resolution Condition</Label>
              <Textarea
                id="yesResolution"
                placeholder="The market will resolve as 'Yes' if..."
                {...form.register("yesResolution", { required: true })}
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="noResolution">"No" Resolution Condition</Label>
              <Textarea
                id="noResolution"
                placeholder="The market will resolve as 'No' if..."
                {...form.register("noResolution", { required: true })}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Market Question</h3>
              <Input
                id="title"
                {...form.register("title", { required: true })}
                className="mt-2"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Resolution Conditions</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-sm">Yes Resolution:</p>
                  <Textarea
                    id="yesResolution"
                    {...form.register("yesResolution", { required: true })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">No Resolution:</p>
                  <Textarea
                    id="noResolution"
                    {...form.register("noResolution", { required: true })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Link 
              href={`/predict/${createdMarketId}`}
              className="block p-6 border rounded-lg hover:bg-accent transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">View your market and start posting evidence</h2>
              <p className="text-muted-foreground">Go directly to your market page to start participating</p>
            </Link>

            <RefreshingLink 
              href="/markets"
              className="block p-6 border rounded-lg hover:bg-accent transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">View all active markets</h2>
              <p className="text-muted-foreground">See your market listed among other active markets</p>
            </RefreshingLink>
          </div>
        );
      default:
        return null;
    }
  };

  // Separate form submission from navigation
  const onSubmit = async (data: MarketFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create market");
      
      const result = await response.json();
      setCreatedMarketId(result.id);
      // Force an immediate refetch of markets data
      await queryClient.refetchQueries({ 
        queryKey: ['markets'],
        type: 'active',
        exact: true
      });
      setCurrentStep(3);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create market",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Tinfoil</h2>
              <p className="text-sm text-muted-foreground">Time Discovers Truth</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="ghost">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className={currentStep === 3 ? 'text-green-600' : ''}>
                {steps[currentStep].title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </CardHeader>
            <CardContent>
              {currentStep === 2 ? (
                // Review step: separate form for submission
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {renderStepContent()}
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Creating..." : "Create Market"}
                    </Button>
                  </div>
                </form>
              ) : (
                // Navigation steps
                <div className="space-y-4">
                  {renderStepContent()}
                  {currentStep < 3 && (
                    <div className="flex justify-between mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                      >
                        Back
                      </Button>
                      <Button type="button" onClick={nextStep}>
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}