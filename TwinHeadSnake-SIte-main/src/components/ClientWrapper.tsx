"use client";

import { useState, useEffect, ReactNode, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useDataContext } from "@/lib/dataContext";

const LoadingScreen = dynamic(() => import("./LoadingScreen"), {
  ssr: false,
});

interface ClientWrapperProps {
  children: ReactNode;
}

const LOADER_SHOWN_KEY = "tws_loader_shown";

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [showLoader, setShowLoader] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const hasInitialized = useRef(false);
  
  
  const { isLoading: dataLoading, isDataCached } = useDataContext();

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let hasSeenLoader = false;
    try {
      hasSeenLoader = sessionStorage.getItem(LOADER_SHOWN_KEY) === "true";
    } catch {
      hasSeenLoader = true;
    }

    if (hasSeenLoader || isDataCached) {
      
      setShowLoader(false);
      setContentVisible(true);
    } else {
      
      setShowLoader(true);
    }
  }, [isDataCached]);

  
  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  
  useEffect(() => {
    if (animationComplete && !dataLoading) {
      try {
        sessionStorage.setItem(LOADER_SHOWN_KEY, "true");
      } catch {
        
      }
      
      setShowLoader(false);
      requestAnimationFrame(() => {
        setContentVisible(true);
      });
    }
  }, [animationComplete, dataLoading]);

  
  useEffect(() => {
    if (isDataCached && !showLoader) {
      setContentVisible(true);
    }
  }, [isDataCached, showLoader]);

  return (
    <>
      {showLoader && <LoadingScreen onComplete={handleAnimationComplete} />}
      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: contentVisible ? "opacity 400ms ease-out" : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
