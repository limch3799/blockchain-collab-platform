"use client"

import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  value?: string
  onSelect?: (value: string) => void
  disabled?: boolean[]
  placeholder?: string
  className?: string
  error?: boolean
}

export function TimePicker({
  value,
  onSelect,
  disabled = [],
  placeholder = "시간",
  className,
  error = false,
}: TimePickerProps) {
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: String(i).padStart(2, '0'),
    label: `${String(i).padStart(2, '0')}:00`,
  }))

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger
        className={cn(
          "w-full !h-[48px] border-2",
          error ? "border-moas-error animate-shake" : value ? "border-moas-state-1" : "border-moas-gray-3",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white shadow-lg border border-gray-200">
        {hourOptions.map((hour, index) => (
          <SelectItem
            key={hour.value}
            value={hour.value}
            disabled={disabled[index]}
          >
            {hour.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
