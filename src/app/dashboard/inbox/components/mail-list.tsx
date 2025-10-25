import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { Mail } from "@/app/dashboard/inbox/data"

interface MailListProps {
  items: Mail[]
  selected: string | null
  onSelect: (id: string) => void
}

export function MailList({ items, selected, onSelect }: MailListProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      {items.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
            selected === item.id && "bg-accent"
          )}
          onClick={() => onSelect(item.id)}
        >
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{item.name}</div>
                {!item.read && (
                  <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div
                className={cn(
                  "ml-auto text-xs",
                  selected === item.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {formatDistanceToNow(new Date(item.date), {
                  addSuffix: true,
                })}
              </div>
            </div>
            <div className="text-xs font-medium">{item.subject}</div>
          </div>
          <div className="line-clamp-2 text-xs text-muted-foreground">
            {item.text.substring(0, 300)}
          </div>
        </button>
      ))}
    </div>
  )
}
