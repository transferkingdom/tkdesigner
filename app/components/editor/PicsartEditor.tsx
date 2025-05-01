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
  exportFormats?: string[];
  exportType?: string;
  mode?: string;
  theme?: string;
  domain?: string;
  origin?: string;
  userAgent?: string;
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

export const PicsartEditor = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<PicsartInstance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isMockEditor, setIsMockEditor] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 2000;

  // This function will enable a mock editor mode when the SDK fails to load
  const enableMockEditorMode = useCallback(() => {
    console.log('Enabling mock editor mode for UI testing');
    setIsMockEditor(true);
    setIsLoading(false);
  }, []);

  const initializeWithRetry = useCallback(async () => {
    if (retryCount >= MAX_RETRIES) {
      console.error('Max retries reached, enabling mock editor');
      enableMockEditorMode();
      return;
    }

    try {
      await initializeEditor();
    } catch (error) {
      console.error('Error initializing editor, retrying...', error);
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        initializeWithRetry();
      }, INITIAL_RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
    }
  }, [retryCount, enableMockEditorMode]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let checkInterval: NodeJS.Timeout;

    const initializeEditor = async () => {
      if (!containerRef.current || !window.Picsart) {
        console.error('Container ref is not available or Picsart SDK not loaded');
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      try {
        // Set a unique ID for the container
        if (!containerRef.current.id) {
          containerRef.current.id = 'picsart-editor-container';
        }

        // Debug API key
        console.log('API Key:', process.env.NEXT_PUBLIC_PICSART_API_KEY);

        // Create Picsart instance according to documentation
        const picsartInstance = new window.Picsart({
          propertyId: 'tkdesigner',
          containerId: containerRef.current.id,
          apiKey: process.env.NEXT_PUBLIC_PICSART_API_KEY || '',
          accessibilityTitle: 'TK Designer',
          debug: true,
          usePicsartInventory: true,
          exportFormats: ['image/png', 'image/jpeg'],
          exportType: 'blob',
          mode: 'image',
          theme: 'light',
          userAgent: 'TKDesigner/1.0',
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
        });

        // Add error handling for API key
        if (!process.env.NEXT_PUBLIC_PICSART_API_KEY) {
          console.error('Picsart API key is missing');
          setLoadError(true);
          setIsLoading(false);
          return;
        }

        // Setup event handlers with error handling
        picsartInstance.onOpen(() => {
          console.log('Picsart editor is ready');
          setIsLoading(false);
          setEditorInstance(picsartInstance);
        });

        // Handle export events
        picsartInstance.onExport((output) => {
          console.log('Export complete:', output);
          if (output.data.imageData) {
            const blob = new Blob([output.data.imageData], { type: 'image/png' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited-image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });

        // Open the editor with specific configuration and error handling
        try {
          picsartInstance.open({
            title: 'TK Designer',
            theme: 'light',
            quality: 90,
            onError: (error) => {
              console.error('Error opening editor:', error);
              setLoadError(true);
              setIsLoading(false);
            }
          });
        } catch (error) {
          console.error('Error opening Picsart editor:', error);
          setLoadError(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Picsart editor:', error);
        setLoadError(true);
        setIsLoading(false);
        setIsMockEditor(true);
      }
    };

    // Check for SDK availability
    const waitForSDK = () => {
      console.log('Waiting for Picsart SDK to load...');
      
      checkInterval = setInterval(() => {
        console.log('Checking if SDK is loaded...');
        if (window.Picsart) {
          console.log('Picsart SDK loaded successfully');
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          initializeWithRetry();
        }
      }, 2000); // Increased interval to 2 seconds

      // Set timeout for SDK loading
      timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        console.error('Picsart SDK failed to load after timeout');
        enableMockEditorMode();
      }, 30000); // Increased timeout to 30 seconds
    };

    waitForSDK();

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
      if (editorInstance) {
        editorInstance.close();
      }
    };
  }, [editorInstance, enableMockEditorMode, initializeWithRetry]);

  // Render a mock editor UI for testing when the SDK fails to load
  const renderMockEditor = () => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
        <div className="border-b border-gray-200 w-full p-4 bg-white flex justify-between items-center">
          <h1 className="text-xl font-bold">TK Designer</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Save</button>
        </div>
        <div className="flex-1 flex">
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Tools</h2>
              <div className="grid grid-cols-3 gap-2">
                {['Text', 'Shape', 'Image', 'Background', 'Upload', 'Templates'].map((tool) => (
                  <div key={tool} className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-md mb-1"></div>
                    <span className="text-xs">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 flex items-center justify-center">
            <div className="w-[500px] h-[500px] bg-white border border-gray-300 shadow-md">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Canvas Area (API connection required)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-white">
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl">Loading Editor...</div>
        </div>
      )}
      
      {loadError && !isMockEditor && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-xl text-red-500 mb-4">Error loading editor</div>
          <p className="mb-4">The Picsart SDK failed to load properly. This may be due to:</p>
          <ul className="list-disc pl-8 mb-4">
            <li>Missing or invalid API key</li>
            <li>Network connectivity issues</li>
            <li>The Picsart service may be temporarily unavailable</li>
          </ul>
          <button 
            onClick={() => setIsMockEditor(true)} 
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Show Demo UI
          </button>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        id="picsart-editor-container" 
        className={`w-full h-full ${(loadError || isMockEditor) ? 'hidden' : ''}`}
        style={{ minWidth: '768px', minHeight: '350px' }}
      />
      
      {isMockEditor && renderMockEditor()}
      
      {editorInstance && <EditorControls editor={editorInstance} />}
      {isMockEditor && <EditorControls editor={{
        export: async () => {
          alert('This is a demo mode. Export functionality requires a valid Picsart API connection.');
          return '';
        }
      }} />}
    </div>
  );
};

export default PicsartEditor; 