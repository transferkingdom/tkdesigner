'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorControls } from './EditorControls';

// Add this to make TypeScript happy with the window.picsart object
declare global {
  interface Window {
    picsart: any;
  }
}

export const PicsartEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!window.picsart) {
      const script = document.createElement('script');
      script.src = 'https://sdk.picsart.io/editor.js';
      script.async = true;
      script.onload = initEditor;
      document.body.appendChild(script);
    } else {
      initEditor();
    }

    return () => {
      if (editorInstance) {
        editorInstance.close();
      }
    };
  }, []);

  const initEditor = () => {
    if (!editorRef.current) return;

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
  };

  const handleSaveDesign = async (design: any) => {
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