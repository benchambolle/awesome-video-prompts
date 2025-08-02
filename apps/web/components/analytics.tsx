"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { useEffect } from "react";

// TypeScript declarations for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function AnalyticsProvider() {
  useEffect(() => {
    // Privacy protection: Prevent sensitive data from being tracked
    const protectSensitiveData = () => {
      // Block analytics from accessing localStorage with API keys
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
          custom_map: {
            // Explicitly exclude sensitive localStorage keys
            exclude_localStorage: ['fal_api_key', 'fal_api_key_timestamp']
          }
        });
      }
      
      // Remove any potential API key data from analytics events
      if (typeof window !== 'undefined' && window.dataLayer) {
        const originalPush = window.dataLayer.push;
        window.dataLayer.push = function(...args: any[]) {
          // Filter out any objects containing API key patterns
          const filteredArgs = args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
              const filtered = { ...arg };
              // Remove any properties that might contain API keys
              Object.keys(filtered).forEach(key => {
                if (key.toLowerCase().includes('api') || 
                    key.toLowerCase().includes('key') ||
                    key.toLowerCase().includes('token') ||
                    (typeof filtered[key] === 'string' && 
                     filtered[key].match(/^[a-f0-9-]{8,}$/i))) {
                  delete filtered[key];
                }
              });
              return filtered;
            }
            return arg;
          });
          return originalPush.apply(this, filteredArgs);
        };
      }
    };
    
    // Apply protection after analytics load
    const timer = setTimeout(protectSensitiveData, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Basic Analytics - Page views, country data */}
      <Analytics />
      <SpeedInsights />
      
      {/* Custom Analytics (if configured) */}
      {process.env.NEXT_PUBLIC_ANALYTICS_URL && process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID && (
        <Script
          defer
          src={process.env.NEXT_PUBLIC_ANALYTICS_URL}
          data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID}
          strategy="afterInteractive"
        />
      )}
      
      {/* Google Analytics - Basic anonymous tracking */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false,
                cookie_flags: 'SameSite=Strict;Secure',
                // Privacy protection: Explicitly exclude sensitive data
                custom_parameter_blacklist: ['api_key', 'fal_api_key', 'token', 'key'],
                send_page_view: true,
                // Only collect essential page and geographic data
                collect_dnt: true
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}
