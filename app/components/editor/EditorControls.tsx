'use client';

import { useState } from 'react';

interface EditorControlsProps {
  editor: {
    export: (options: { format: string; quality: number; transparent: boolean }) => Promise<string>;
  };
}

interface ProductOptions {
  size: string;
  quantity: number;
  color: string;
}

export const EditorControls = ({ editor }: EditorControlsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOptions>({
    size: 'Medium',
    quantity: 1,
    color: 'white',
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get design from Editor
      const result = await editor.export({
        format: 'png',
        quality: 100,
        transparent: true,
      });

      // TODO: Process the design and optimize it using Picsart API
      console.log('Exported design:', result);
      
      // TODO: Create custom product in Shopify
      // This will be implemented as we build the API endpoints

      // For now, just log the data and show a success message
      alert('Design exported successfully. Shopify integration coming soon!');

      // Eventually we'll redirect to the product page:
      // router.push(`/products/${productId}?image=${encodeURIComponent(imageUrl)}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error saving the design. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (option: keyof ProductOptions, value: string | number) => {
    setProductOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-[300px]">
      <h3 className="text-lg font-semibold mb-3">DTF Transfer Properties</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Size</label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={productOptions.size}
          onChange={(e) => handleOptionChange('size', e.target.value)}
        >
          <option value="Small">Small (20x20 cm)</option>
          <option value="Medium">Medium (30x30 cm)</option>
          <option value="Large">Large (40x40 cm)</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={productOptions.quantity}
          onChange={(e) => handleOptionChange('quantity', parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 10, 20, 30, 50, 100].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Transfer Color</label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={productOptions.color}
          onChange={(e) => handleOptionChange('color', e.target.value)}
        >
          <option value="white">White</option>
          <option value="transparent">Transparent</option>
        </select>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <div className="text-sm text-gray-600">
          <p>Estimated price: ${productOptions.size === 'Small' ? '24.99' : productOptions.size === 'Medium' ? '29.99' : '34.99'}</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors disabled:bg-blue-400"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Processing...' : 'Create Product'}
        </button>
      </div>
    </div>
  );
}; 