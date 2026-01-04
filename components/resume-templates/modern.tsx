import { Card } from "@/components/ui/card";
import { LineItem } from "@/types/resume";

interface ModernTemplateProps {
  lines: LineItem[];
  resumeRef: React.RefObject<HTMLDivElement>;
  wrapperClass: string;
  borderColor: string;
  zoomStyle: React.CSSProperties;
  resumeBackgroundColor?: string;
}

export function ModernTemplate({
  lines,
  resumeRef,
  wrapperClass,
  borderColor,
  zoomStyle,
  resumeBackgroundColor,
}: ModernTemplateProps) {
  return (
    <div className="resume-container">
      <div className="resume-content" style={zoomStyle}>
        <Card
          ref={resumeRef}
          className={`${wrapperClass} resume-content border-t-4`}
          style={{ 
            borderTopColor: borderColor,
            backgroundColor: resumeBackgroundColor || '#ffffff'
          }}
        >
          <div className="grid grid-cols-[2rem_1fr] h-full">
            {/* Left color bar */}
            <div className="h-full" />
            
            {/* Main content */}
            <div className="py-6 pr-6">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className={`
                    ${line.type === 'header' ? 'col-span-2 text-center mb-6' : ''}
                    ${line.type === 'skills' ? 'mt-4' : ''}
                  `}
                >
                  {line.content}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 