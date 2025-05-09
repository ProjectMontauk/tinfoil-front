import React from 'react';
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import PredictionPage from "./pages/PredictionPage";
import PredictionMarketsPage from "./pages/PredictionMarketsPage";
import CreateMarketPage from "./pages/CreateMarketPage";
import { ThirdwebProvider } from "thirdweb/react";

function App() {
  return (
    <ThirdwebProvider 
      client={{
        clientId: "a15d38ed4bcc801db1b94a08f9a1755b",
      }}
    >
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/markets" component={PredictionMarketsPage} />
          <Route path="/predict/:id" component={PredictionPage} />
          <Route path="/markets/create" component={CreateMarketPage} />
        </Switch>
        <Toaster />
      </div>
    </ThirdwebProvider>
  );
}

export default App;

// clientId="a15d38ed4bcc801db1b94a08f9a1755b"
// supportedWallets={[]}