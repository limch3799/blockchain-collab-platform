"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { ko } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  minDate?: Date
  placeholder?: string
  className?: string
  error?: boolean
}

export function DatePicker({
  date,
  onSelect,
  minDate,
  placeholder = "날짜 선택",
  className,
  error = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[400px] max-w-[200px] justify-start text-left font-normal h-[48px] border-2",
            !date && "text-muted-foreground",
            error ? "border-moas-error animate-shake" : date ? "border-moas-state-1" : "border-moas-gray-3",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy년 MM월 dd일", { locale: ko }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white shadow-lg border border-gray-200">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={(date) => {
            if (minDate) {
              return date < minDate
            }
            return false
          }}
          initialFocus
          locale={ko}
        />
      </PopoverContent>
    </Popover>
  )
}
