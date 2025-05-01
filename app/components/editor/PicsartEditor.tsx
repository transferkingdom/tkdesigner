'use client';

import { useEffect, useRef, useState } from 'react';
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
  exportFormats?: string[];
  exportType?: string;
  mode?: string;
  theme?: string;
  domain?: string;
  origin?: string;
  userAgent?: string;
  analytics?: boolean;
  features?: {
    undoRedoControls?: boolean;
    zoomControls?: boolean;
    tools?: string[];
  };
  categories?: {
    templates?: Record<string, unknown>;
    photos?: {
      thumbnailHeader?: boolean;
    };
    text?: {
      title?: boolean;
    };
    uploads?: {
      title?: boolean;
    };
    elements?: {
      smallTitle?: boolean;
    };
    background?: {
      header?: boolean;
      tabs?: string[];
    };
  };
  branding?: {
    accents?: string;
    hover?: string;
    main?: string;
    texts?: string;
    background?: string;
  };
}

interface ExportOutput {
  data: {
    imageData?: string;
    pdfData?: string;
    printData?: string;
    previewPdfData?: string;
    replayData?: string;
  };
}

interface OpenOptions {
  title?: string;
  theme?: 'light' | 'dark';
  quality?: number;
  exportFormats?: string[];
  onError?: (error: Error) => void;
}

interface PicsartInstance {
  open: (options?: OpenOptions) => void;
  close: () => void;
  onOpen: (callback: () => void) => void;
  onExport: (callback: (output: ExportOutput) => void) => void;
  export: (options: { format: string; quality: number; transparent: boolean }) => Promise<string>;
}

const PicsartEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const initEditor = async () => {
      try {
        setIsLoading(true);
        console.log('Checking if SDK is loaded...');

        // SDK yükleme kontrolü
        if (!(window as any).Picsart) {
          const script = document.createElement('script');
          script.src = 'https://sdk.picsart.io/1.12.4/sdk/picsart.js';
          script.async = true;
          document.body.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        console.log('Picsart SDK loaded successfully');

        // API Key kontrolü
        const apiKey = process.env.NEXT_PUBLIC_PICSART_API_KEY;
        if (!apiKey) {
          throw new Error('API Key not found');
        }
        console.log('API Key available:', !!apiKey);

        // Editor ayarları
        const editorSettings = {
          propertyId: 'tkdesigner',
          containerId: editorRef.current?.id || 'picsart-editor',
          apiKey,
          accessibilityTitle: 'TK Designer',
          debug: true,
          usePicsartInventory: true,
          exportFormats: ['image/png', 'image/jpeg'],
          exportType: 'blob',
          mode: 'image',
          theme: 'light',
          userAgent: 'TKDesigner/1.0',
          origin: window.location.origin,
          domain: window.location.hostname,
          analytics: false,
          features: {
            undoRedoControls: true,
            zoomControls: true,
            tools: [
              'effects',
              'eraser',
              'duplicate',
              'adjust',
              'edit',
              'color',
              'gradient',
              'font',
              'border',
              'outline',
              'shadow',
              'crop',
              'flip_rotate',
              'position',
              'tool_removeBG'
            ],
          },
          categories: {
            templates: {},
            photos: {
              thumbnailHeader: false,
            },
            text: {
              title: false,
            },
            uploads: {
              title: false,
            },
            elements: {
              smallTitle: true,
            },
            background: {
              header: false,
              tabs: ['Color']
            },
          },
          branding: {
            accents: '#eec443',
            hover: '#eed792',
            main: '#1f3b5e',
            texts: '#ffffff',
            background: '#0a1e37',
          }
        };

        // Editor başlatma
        if ((window as any).Picsart) {
          // Container ID'sini ayarla
          if (!editorRef.current?.id) {
            editorRef.current!.id = 'picsart-editor';
          }

          const editor = new (window as any).Picsart(editorSettings);

          editor.onOpen(() => {
            console.log('Editor loaded successfully');
            setIsLoading(false);
          });

          editor.onError((error: any) => {
            console.error('Editor error:', error);
            if (retryCount < maxRetries) {
              setRetryCount(prev => prev + 1);
              initEditor();
            }
          });

          editor.open({
            title: 'TK Designer',
            theme: 'light',
            quality: 90
          });
        } else {
          throw new Error('Picsart SDK not loaded properly');
        }

      } catch (error) {
        console.error('Editor initialization error:', error);
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(initEditor, 1000 * (retryCount + 1));
        }
      }
    };

    initEditor();

    return () => {
      // Cleanup
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    };
  }, [retryCount]);

  return (
    <div className="relative w-full h-full min-h-screen">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-lg font-semibold">Editor yükleniyor...</div>
        </div>
      )}
      <div 
        ref={editorRef} 
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />
    </div>
  );
};

export default PicsartEditor; 