'use client';

import { useEffect, useRef, useState } from 'react';

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

const SDK_URL = '/api/proxy/sdk';
const CONTAINER_ID = 'picsart-editor-container';
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
        try {
          if ((window as unknown as PicsartWindow).Picsart) {
            console.log('SDK already loaded');
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = SDK_URL;
          script.async = true;
          script.defer = true;
          script.crossOrigin = 'anonymous';
          script.type = 'text/javascript';
          
          const timeoutId = setTimeout(() => {
            console.error('SDK loading timeout');
            reject(new Error('SDK loading timeout after 10s'));
          }, 10000);

          script.onload = () => {
            clearTimeout(timeoutId);
            console.log('SDK script loaded successfully');
            
            // SDK yüklendikten sonra kısa bir bekleme
            setTimeout(() => {
              if ((window as unknown as PicsartWindow).Picsart) {
                console.log('Picsart object found in window');
                resolve();
              } else {
                console.error('SDK loaded but Picsart object not found in window');
                reject(new Error('SDK loaded but Picsart object not found'));
              }
            }, 500);
          };
          
          script.onerror = async (error) => {
            clearTimeout(timeoutId);
            try {
              const response = await fetch(SDK_URL);
              const errorDetails = await response.text();
              console.error('Failed to load SDK script. Details:', {
                error,
                response: errorDetails,
                status: response.status,
                headers: Object.fromEntries(response.headers),
                url: SDK_URL
              });
            } catch (fetchError) {
              console.error('Error fetching SDK error details:', fetchError);
            }
            reject(new Error('Failed to load Picsart SDK'));
          };

          // Remove any existing SDK script
          const existingScript = document.querySelector(`script[src="${SDK_URL}"]`);
          if (existingScript) {
            existingScript.remove();
          }

          document.head.appendChild(script);
        } catch (error) {
          console.error('Error in loadSDK:', error);
          reject(error);
        }
      });
    };

    const initEditor = async () => {
      try {
        setIsLoading(true);
        console.log('Starting editor initialization...');

        await loadSDK();
        
        // API Key kontrolü
        const apiKey = process.env.NEXT_PUBLIC_PICSART_API_KEY;
        if (!apiKey) {
          throw new Error('API Key not found in environment variables');
        }
        console.log('API Key validation successful');

        // Container ID'sini ayarla
        if (currentEditorRef && !currentEditorRef.id) {
          currentEditorRef.id = CONTAINER_ID;
          console.log('Container ID set:', CONTAINER_ID);
        }

        // Editor ayarları
        const editorSettings: PicsartConfig = {
          propertyId: 'tkdesigner',
          containerId: CONTAINER_ID,
          apiKey,
          accessibilityTitle: 'TK Designer',
          debug: true,
          usePicsartInventory: true,
          exportFormats: ['image/png', 'image/jpeg'],
          exportType: 'blob',
          mode: 'image',
          theme: 'light',
          userAgent: navigator.userAgent,
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

        console.log('Editor settings prepared:', { containerId: editorSettings.containerId, mode: editorSettings.mode });

        // Editor başlatma
        if (!(window as unknown as PicsartWindow).Picsart) {
          throw new Error('Picsart SDK not found after loading');
        }

        const editor = new (window as unknown as PicsartWindow).Picsart(editorSettings);
        console.log('Editor instance created');

        editor.onOpen(() => {
          console.log('Editor opened successfully');
          setIsLoading(false);
        });

        editor.onError((error: PicsartError) => {
          console.error('Editor error:', error);
          if (error.code === 'AUTH_ERROR' || error.code === '401') {
            console.error('Authentication error. API key may be invalid.');
            setIsLoading(false);
          } else if (retryCount < MAX_RETRIES) {
            console.log(`Retrying initialization (${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            setTimeout(initEditor, RETRY_DELAY * (retryCount + 1));
          }
        });

        editor.open({
          title: 'TK Designer',
          theme: 'light',
          quality: 90
        });
        
      } catch (error) {
        console.error('Editor initialization error:', error);
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying initialization (${retryCount + 1}/${MAX_RETRIES})`);
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
          minWidth: '768px',
          minHeight: '350px',
          height: 'calc(100vh - 60px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default PicsartEditor; 