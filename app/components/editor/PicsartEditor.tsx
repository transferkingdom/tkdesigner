'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorControls } from './EditorControls';

// Add this to make TypeScript happy with the window.picsart object
declare global {
  interface Window {
    Picsart: any;
    picsart: {
      createEditor: (config: EditorConfig) => PicsartEditor;
    };
  }
}

interface EditorConfig {
  container: HTMLDivElement;
  apiKey: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  ui: {
    showHeader: boolean;
    mode: string;
  };
  templates: {
    show: boolean;
    categories: string[];
  };
  onReady: () => void;
  onSave: (design: Design) => void;
}

interface PicsartEditor {
  close: () => void;
  export: (options: { format: string; quality: number; transparent: boolean }) => Promise<string>;
}

interface Design {
  id: string;
  [key: string]: unknown;
}

export const PicsartEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<PicsartEditor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Use the new Picsart SDK approach
    const loadEditor = () => {
      const script = document.createElement('script');
      script.src = 'https://sdk.picsart.io/cdn?key=sdk';
      script.async = true;
      script.onload = () => {
        // Try to use the new API format first
        if (window.Picsart) {
          initNewEditor();
        } else if (window.picsart) {
          initEditor();
        } else {
          console.error('Picsart SDK failed to load properly');
        }
      };
      document.body.appendChild(script);
    };

    loadEditor();

    return () => {
      if (editorInstance) {
        editorInstance.close();
      }
    };
  }, [editorInstance]);

  const initNewEditor = () => {
    if (!editorRef.current) return;

    try {
      // New SDK format
      const PicsartInstance = new window.Picsart({
        propertyId: 'tkdesigner', 
        containerId: editorRef.current.id || 'editor-container',
        apiKey: process.env.NEXT_PUBLIC_PICSART_API_KEY || '',
      });

      // Set a unique ID for the editor container if not already set
      if (!editorRef.current.id) {
        editorRef.current.id = 'editor-container';
      }

      PicsartInstance.onOpen(() => {
        console.log('Editor is open');
        setIsLoading(false);
        setEditorInstance(PicsartInstance);
      });

      PicsartInstance.open({
        title: 'TK Designer'
      });
    } catch (error) {
      console.error('Error initializing Picsart editor:', error);
    }
  };

  const initEditor = () => {
    if (!editorRef.current) return;

    try {
      // Old SDK format
      const editor = window.picsart.createEditor({
        container: editorRef.current,
        apiKey: process.env.NEXT_PUBLIC_PICSART_API_KEY || '',
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
        },
        ui: {
          showHeader: true,
          mode: 'advanced',
        },
        templates: {
          show: true,
          categories: ['tshirts', 'hoodies', 'custom'],
        },
        onReady: () => {
          setEditorInstance(editor);
          setIsLoading(false);
        },
        onSave: handleSaveDesign,
      });
    } catch (error) {
      console.error('Error initializing Picsart editor:', error);
    }
  };

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
      <div ref={editorRef} className="w-full h-full" />
      {editorInstance && <EditorControls editor={editorInstance} />}
    </div>
  );
};

export default PicsartEditor; 