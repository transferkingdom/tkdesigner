'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorControls } from './EditorControls';

// Define proper types for the Picsart SDK
declare global {
  interface Window {
    Picsart: {
      new(config: PicsartConfig): PicsartInstance;
    };
  }
}

interface PicsartConfig {
  propertyId: string;
  containerId: string;
  apiKey?: string;
  accessibilityTitle?: string;
  logo?: string;
  usePicsartInventory?: boolean;
  debug?: boolean;
}

interface PicsartInstance {
  open: (options?: { title?: string }) => void;
  close: () => void;
  onOpen: (callback: () => void) => void;
  onExport: (callback: (output: any) => void) => void;
  export: (options: { format: string; quality: number; transparent: boolean }) => Promise<string>;
}

interface Design {
  id: string;
  [key: string]: unknown;
}

export const PicsartEditor = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<PicsartInstance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Use useCallback to memoize the initEditor function
  const initEditor = useCallback(() => {
    if (!containerRef.current || !window.Picsart) {
      console.error('Container ref is not available or Picsart SDK not loaded');
      return;
    }

    try {
      // Set a unique ID for the container
      if (!containerRef.current.id) {
        containerRef.current.id = 'picsart-editor-container';
      }

      // Create Picsart instance according to documentation
      const picsartInstance = new window.Picsart({
        propertyId: 'tkdesigner',
        containerId: containerRef.current.id,
        apiKey: process.env.NEXT_PUBLIC_PICSART_API_KEY || '',
        accessibilityTitle: 'TK Designer',
      });

      // Setup event handlers
      picsartInstance.onOpen(() => {
        console.log('Picsart editor is ready');
        setIsLoading(false);
        setEditorInstance(picsartInstance);
      });

      // Open the editor
      picsartInstance.open({
        title: 'TK Designer'
      });
    } catch (error) {
      console.error('Error initializing Picsart editor:', error);
    }
  }, []);

  useEffect(() => {
    // Load Picsart SDK script
    const loadPicsartSDK = () => {
      // Check if script is already loaded
      if (document.getElementById('picsart-sdk-script')) {
        initEditor();
        return;
      }

      const script = document.createElement('script');
      script.id = 'picsart-sdk-script';
      script.src = 'https://sdk.picsart.io/cdn?v=1.0.0&key=sdk';
      script.async = true;
      script.onload = initEditor;
      document.head.appendChild(script);
    };

    loadPicsartSDK();

    return () => {
      if (editorInstance) {
        editorInstance.close();
      }
    };
  }, [editorInstance, initEditor]);

  const handleSaveDesign = async (design: Design) => {
    // Here we'll implement the integration with Shopify
    console.log('Design saved:', design);
    
    // This will be implemented later:
    // 1. Export the design as high-quality PNG
    // 2. Create a custom product variant in Shopify
    // 3. Redirect to the product page
  };

  return (
    <div className="w-full h-screen bg-white">
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl">Loading Editor...</div>
        </div>
      )}
      <div 
        ref={containerRef} 
        id="picsart-editor-container" 
        className="w-full h-full" 
        style={{ minWidth: '768px', minHeight: '350px' }}
      />
      {editorInstance && <EditorControls editor={editorInstance} />}
    </div>
  );
};

export default PicsartEditor; 