import { cn } from "@/lib/utils";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  animated?: boolean;
}

export function Shimmer({ className, animated = true, ...props }: ShimmerProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-gray-200",
        animated ? "shimmer" : "",
        className
      )}
      {...props}
    />
  );
}
