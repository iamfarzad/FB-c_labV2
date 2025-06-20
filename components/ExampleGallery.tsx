// @/components/ExampleGallery.tsx
import React from 'react';
import type { Example } from '@/lib/types'; // Assuming Example type exists or will be created

interface ExampleGalleryProps {
  title: string;
  onSelectExample: (example: Example) => void;
  selectedExample: Example | null;
  // examples?: Example[]; // Optional: if examples are passed directly
}

export default function ExampleGallery({ title, onSelectExample, selectedExample }: ExampleGalleryProps) {
  // Placeholder examples if not passed via context or props
  const placeholderExamples: Example[] = [
    { title: "Example 1 (Placeholder)", url: "http://example.com/1", spec: "Spec 1", code: "Code 1" },
    { title: "Example 2 (Placeholder)", url: "http://example.com/2", spec: "Spec 2", code: "Code 2" },
  ];

  // In a real component, you might fetch examples or get them from context.
  // const { examples } = React.useContext(DataContext); // If using context

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm my-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="space-y-2">
        {(placeholderExamples).map((ex, index) => (
          <button
            key={index}
            onClick={() => onSelectExample(ex)}
            className={`w-full text-left p-2 rounded-md hover:bg-muted ${selectedExample?.url === ex.url ? 'bg-muted font-semibold' : ''}`}
          >
            {ex.title || `Example based on: ${ex.url}`}
          </button>
        ))}
      </div>
      {selectedExample && <p className="text-xs mt-2 text-muted-foreground">Selected: {selectedExample.title}</p>}
    </div>
  );
}
