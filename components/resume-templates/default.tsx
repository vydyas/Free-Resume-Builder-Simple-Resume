import { Card } from "@/components/ui/card";
import { LineItem } from "@/types/resume";

interface DefaultTemplateProps {
  lines: LineItem[];
  resumeRef: React.RefObject<HTMLDivElement>;
  wrapperClass: string;
  borderColor: string;
  zoomStyle: React.CSSProperties;
  resumeBackgroundColor?: string;
}

export function DefaultTemplate({
  lines,
  resumeRef,
  wrapperClass,
  borderColor,
  zoomStyle,
  resumeBackgroundColor,
}: DefaultTemplateProps) {
  return (
    <div className="resume-container">
      <div className="resume-content" style={zoomStyle}>
        <Card
          ref={resumeRef}
          className={`${wrapperClass} resume-content border-t-4 relative`}
          style={{ 
            borderTopColor: borderColor,
            backgroundColor: resumeBackgroundColor || '#ffffff'
          }}
        >
          <div className="h-full overflow-y-auto px-4 py-2">
            {lines.map((line) => (
              <div key={line.id}>
                {line.content}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 