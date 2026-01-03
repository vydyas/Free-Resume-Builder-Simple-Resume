"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

interface PDFThumbnailProps {
  pdfUrl: string;
  className?: string;
}

export function PDFThumbnail({ pdfUrl, className = "" }: PDFThumbnailProps) {
  const [error, setError] = useState(false);

  // Use iframe to show first page of PDF as thumbnail
  // This avoids SSR issues with pdfjs-dist
  const iframeUrl = `${pdfUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`;

  return (
    <>
      <style jsx global>{`
        .pdf-thumbnail-iframe {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .pdf-thumbnail-iframe::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .pdf-thumbnail-container iframe {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .pdf-thumbnail-container iframe::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      <div className={`pdf-thumbnail-container rounded-lg overflow-hidden border border-gray-200 bg-white relative ${className}`} style={{ height: '320px' }}>
        {error ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center p-4">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">PDF Preview</p>
            </div>
          </div>
        ) : (
          <div 
            className="w-full h-full overflow-hidden scrollbar-hide" 
            style={{ 
              overflow: 'hidden'
            }}
          >
            <iframe
              src={iframeUrl}
              className="w-full h-full border-0 pdf-thumbnail-iframe"
              style={{ 
                overflow: 'hidden',
                border: 'none',
                display: 'block',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              title="PDF thumbnail"
              onError={() => setError(true)}
              loading="lazy"
              scrolling="no"
            />
          </div>
        )}
      </div>
    </>
  );
}

