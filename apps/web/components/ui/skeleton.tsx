import { cn } from "@/lib/utils";

/** Shimmering placeholder block. Use to mark loading regions per spec
 *  ("No full-page loading spinners — use skeleton loaders per section"). */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...props} />;
}

export { Skeleton };
