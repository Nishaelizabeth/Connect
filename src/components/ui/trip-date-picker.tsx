import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import React, { useRef, useState } from "react";
import { useClickOutside } from "@/components/ui/use-click-outside";
import { clsx } from "clsx";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface TripDatePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  minValue?: Date;
  placeholder?: string;
  error?: boolean;
}

const CalendarIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="shrink-0">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.5 0.5V1.25V2H10.5V1.25V0.5H12V1.25V2H14H15.5V3.5V13.5C15.5 14.8807 14.3807 16 13 16H3C1.61929 16 0.5 14.8807 0.5 13.5V3.5V2H2H4V1.25V0.5H5.5ZM2 3.5H14V6H2V3.5ZM2 7.5V13.5C2 14.0523 2.44772 14.5 3 14.5H13C13.5523 14.5 14 14.0523 14 13.5V7.5H2Z"
      className="fill-gray-400"
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5 14.0607L9.96966 13.5303L5.14644 8.7071C4.75592 8.31658 4.75592 7.68341 5.14644 7.29289L9.96966 2.46966L10.5 1.93933L11.5607 2.99999L11.0303 3.53032L6.56065 7.99999L11.0303 12.4697L11.5607 13L10.5 14.0607Z"
      className="fill-gray-500"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.50001 1.93933L6.03034 2.46966L10.8536 7.29288C11.2441 7.68341 11.2441 8.31657 10.8536 8.7071L6.03034 13.5303L5.50001 14.0607L4.43935 13L4.96968 12.4697L9.43935 7.99999L4.96968 3.53032L4.43935 2.99999L5.50001 1.93933Z"
      className="fill-gray-500"
    />
  </svg>
);

const ClearIcon = () => (
  <svg height="14" strokeLinejoin="round" viewBox="0 0 16 16" width="14">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z"
      className="fill-gray-400"
    />
  </svg>
);

export const TripDatePicker: React.FC<TripDatePickerProps> = ({
  value,
  onChange,
  minValue,
  placeholder = "Select date range",
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Build the days grid
  const daysArray: Date[] = [];
  let day = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  while (day <= monthEnd) {
    daysArray.push(day);
    day = addDays(day, 1);
  }

  const isAllowed = (d: Date) => {
    if (minValue && startOfDay(d) < startOfDay(minValue)) return false;
    return true;
  };

  const handleDateClick = (d: Date) => {
    if (!isAllowed(d)) return;

    if (!value?.start || (value.start && value.end)) {
      // Start fresh selection
      onChange({ start: startOfDay(d), end: null });
      setHoverDate(d);
      setIsSelecting(true);
    } else if (isSelecting) {
      // Complete the selection
      if (d > value.start) {
        onChange({ start: value.start, end: startOfDay(d) });
      } else {
        onChange({ start: startOfDay(d), end: value.start });
      }
      setIsSelecting(false);
      setHoverDate(null);
      setIsOpen(false);
    }
  };

  const handleMouseEnter = (d: Date) => {
    if (value?.start && !value.end && isSelecting) {
      setHoverDate(d);
    }
  };

  const formatDisplay = () => {
    if (!value?.start) return null;
    if (!value.end) return format(value.start, "MMM d, yyyy");
    return `${format(value.start, "MMM d, yyyy")} – ${format(value.end, "MMM d, yyyy")}`;
  };

  const displayText = formatDisplay();

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center gap-2 border rounded-lg px-3 py-3 text-left text-sm transition-colors bg-white",
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          isOpen && !error && "ring-2 ring-blue-500 border-transparent"
        )}
      >
        <CalendarIcon />
        <span className={clsx("flex-1 truncate", displayText ? "text-gray-800" : "text-gray-400")}>
          {displayText ?? placeholder}
        </span>
        {value?.start && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              setIsSelecting(false);
            }}
            className="p-0.5 rounded hover:bg-gray-100 transition-colors"
            aria-label="Clear dates"
          >
            <ClearIcon />
          </button>
        )}
      </button>

      {/* Calendar popover */}
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+6px)] left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[300px]">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ArrowLeftIcon />
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ArrowRightIcon />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 text-center mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-xs font-medium text-gray-400 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {daysArray.map((d) => {
              const isStart = value?.start ? isSameDay(d, value.start) : false;
              const isEnd = value?.end ? isSameDay(d, value.end) : false;
              const inRange =
                value?.start &&
                ((value.end && isWithinInterval(d, { start: value.start, end: value.end })) ||
                  (hoverDate && isSelecting && d > value.start &&
                    isWithinInterval(d, { start: value.start, end: hoverDate })));
              const isHover = hoverDate && isSelecting && isSameDay(d, hoverDate);
              const allowed = isAllowed(d);
              const currentMonth = isSameMonth(d, currentDate);
              const todayDate = isToday(d);

              return (
                <div
                  key={d.toString()}
                  className={clsx(
                    "flex items-center justify-center",
                    inRange && !isStart && !isEnd && "bg-blue-50"
                  )}
                  onMouseEnter={() => allowed && handleMouseEnter(d)}
                  onClick={() => allowed && handleDateClick(d)}
                >
                  <div
                    className={clsx(
                      "h-8 w-8 flex items-center justify-center rounded-full text-sm transition-colors select-none",
                      !allowed && "text-gray-300 cursor-not-allowed",
                      allowed && currentMonth && !isStart && !isEnd && !isHover && "cursor-pointer hover:bg-gray-100 text-gray-700",
                      allowed && !currentMonth && !isStart && !isEnd && !isHover && "cursor-pointer hover:bg-gray-100 text-gray-400",
                      todayDate && !isStart && !isEnd && !isHover && allowed && "bg-blue-100 text-blue-600 font-semibold",
                      (isStart || isEnd) && allowed && "bg-blue-600 text-white font-semibold cursor-pointer",
                      isHover && !isStart && allowed && "bg-blue-500 text-white cursor-pointer"
                    )}
                  >
                    {format(d, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
            {!value?.start
              ? "Click to select start date"
              : !value?.end
                ? "Click to select end date"
                : `${format(value.start, "MMM d")} – ${format(value.end, "MMM d, yyyy")}`}
          </div>
        </div>
      )}
    </div>
  );
};
