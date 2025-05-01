'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorControls } from './EditorControls';

// Types
interface PicsartSDK {
  new(config: PicsartConfig): PicsartInstance;
}

interface PicsartWindow extends Window {
  Picsart: PicsartSDK;
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

interface PicsartError extends Error {
  code?: string;
  details?: unknown;
}

interface PicsartInstance {
  open: (options?: OpenOptions) => void;
  close: () => void;
  onOpen: (callback: () => void) => void;
  onError: (callback: (error: PicsartError) => void) => void;
}

interface OpenOptions {
  title?: string;
  theme?: 'light' | 'dark';
  quality?: number;
}

const SDK_URL = 'https://sdk.picsart.io/cdn?v=1.0.0&key=sdk';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const PicsartEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const currentEditorRef = editorRef.current;
    
    const loadSDK = async (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if ((window as unknown as PicsartWindow).Picsart) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = SDK_URL;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Picsart SDK'));
        document.head.appendChild(script);
      });
    };

    const initEditor = async () => {
      try {
        setIsLoading(true);
        console.log('Checking if SDK is loaded...');

        await loadSDK();
        console.log('Picsart SDK loaded successfully');

        // API Key kontrolü
        const apiKey = process.env.NEXT_PUBLIC_PICSART_API_KEY;
        if (!apiKey) {
          throw new Error('API Key not found');
        }
        console.log('API Key available:', !!apiKey);

        // Container ID'sini ayarla
        if (!currentEditorRef?.id) {
          currentEditorRef!.id = 'picsart-editor';
        }

        // Editor ayarları
        const editorSettings: PicsartConfig = {
          propertyId: 'tkdesigner',
          containerId: currentEditorRef!.id,
          apiKey,
          accessibilityTitle: 'TK Designer',
          debug: true,
          usePicsartInventory: true,
          exportFormats: ['image/png', 'image/jpeg'],
          exportType: 'blob',
          mode: 'image',
          theme: 'light',
          userAgent: 'Mozilla/5.0',
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
        if ((window as unknown as PicsartWindow).Picsart) {
          const editor = new (window as unknown as PicsartWindow).Picsart(editorSettings);

          editor.onOpen(() => {
            console.log('Editor loaded successfully');
            setIsLoading(false);
          });

          editor.onError((error: PicsartError) => {
            console.error('Editor error:', error);
            if (error.code === 'AUTH_ERROR' || error.code === '401') {
              console.error('Authentication error. Please check your API key.');
              setIsLoading(false);
            } else if (retryCount < MAX_RETRIES) {
              setRetryCount(prev => prev + 1);
              setTimeout(initEditor, RETRY_DELAY * (retryCount + 1));
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
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(initEditor, RETRY_DELAY * (retryCount + 1));
        } else {
          setIsLoading(false);
          console.error('Max retries reached. Editor failed to initialize.');
        }
      }
    };

    initEditor();

    return () => {
      if (currentEditorRef) {
        currentEditorRef.innerHTML = '';
      }
    };
  }, [retryCount]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
          <div className="text-lg font-semibold">Editor yükleniyor...</div>
        </div>
      )}
      <div 
        ref={editorRef} 
        className="w-full flex-1"
        style={{ 
          minHeight: 'calc(100vh - 60px)',
          height: 'calc(100vh - 60px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default PicsartEditor; 