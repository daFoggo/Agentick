import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface IBigCalendarSkeletonProps {
  className?: string
  headerClassName?: string
}

export function BigCalendarSkeleton({
  className,
  headerClassName,
}: IBigCalendarSkeletonProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden bg-background",
        className
      )}
    >
      {/* Skeleton Toolbar */}
      <div
        className={cn(
          "flex items-center gap-2 border-b p-2",
          headerClassName
        )}
      >
        <Skeleton className="h-8 w-[60px]" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-5 w-[150px]" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-[120px]" />
      </div>

      {/* Skeleton Week View */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Sticky day header row */}
        <div className="flex shrink-0 border-b bg-card">
          <div className="w-14 shrink-0" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="min-w-0 flex-1 border-l border-border/50">
              <div className="flex flex-col items-center justify-center p-2">
                <Skeleton className="mb-1 h-3 w-8" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable time grid */}
        <div className="no-scrollbar flex min-h-0 flex-1 overflow-hidden">
          {/* Time gutter */}
          <div className="w-14 shrink-0 bg-background pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex justify-end pr-2" style={{ height: 60 }}>
                <Skeleton className="mt-[-6px] h-3 w-8" />
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex min-w-0 flex-1">
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="relative min-w-0 flex-1 border-l border-border/50"
              >
                {/* Giả lập time slots lines */}
                {Array.from({ length: 12 }).map((_, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="absolute left-0 right-0 border-t border-border/50"
                    style={{
                      top: rowIdx * 60,
                      height: 60,
                    }}
                  />
                ))}

                {/* Giả lập vài event blocks cho sinh động */}
                {colIdx === 1 && (
                  <Skeleton className="absolute left-1 right-1 top-[120px] h-[120px] rounded-md opacity-50" />
                )}
                {colIdx === 3 && (
                  <Skeleton className="absolute left-1 right-1 top-[60px] h-[60px] rounded-md opacity-50" />
                )}
                {colIdx === 4 && (
                  <Skeleton className="absolute left-1 right-1 top-[240px] h-[180px] rounded-md opacity-50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
