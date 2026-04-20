
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DAYS_OF_WEEK, DayOfWeek } from "@/api/restaurant/constants";

interface OperatingHours {
  open: string;
  close: string;
  closed?: boolean;
}

interface OperatingHoursEditorProps {
  value: Record<string, OperatingHours>;
  onChange: (value: Record<string, OperatingHours>) => void;
}

export function OperatingHoursEditor({ value, onChange }: OperatingHoursEditorProps) {
  const handleDayChange = (day: DayOfWeek, field: keyof OperatingHours, newValue: string | boolean) => {
    const updatedHours = {
      ...value,
      [day]: {
        ...value[day],
        [field]: newValue,
      },
    };
    onChange(updatedHours);
  };

  const applyMondayToAll = () => {
    const mondayHours = value.monday;
    const updatedHours = { ...value };
    DAYS_OF_WEEK.forEach((day) => {
      if (day !== "monday") {
        updatedHours[day] = { ...mondayHours };
      }
    });
    onChange(updatedHours);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-sm">Weekly Schedule</h4>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={applyMondayToAll}
          className="text-xs h-8"
        >
          Apply Monday to all days
        </Button>
      </div>
      
      {DAYS_OF_WEEK.map((day) => {
        const dayHours = value[day] || { open: "09:00", close: "21:00", closed: false };
        return (
          <div key={day} className="grid grid-cols-4 gap-4 items-center mb-3">
            <label className="capitalize text-sm font-medium">{day}</label>
            <Input
              type="time"
              value={dayHours.open}
              onChange={(e) => handleDayChange(day, "open", e.target.value)}
              disabled={dayHours.closed}
              className={dayHours.closed ? "opacity-50" : ""}
            />
            <Input 
              type="time" 
              value={dayHours.close}
              onChange={(e) => handleDayChange(day, "close", e.target.value)}
              disabled={dayHours.closed}
              className={dayHours.closed ? "opacity-50" : ""}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`closed-${day}`}
                checked={!!dayHours.closed}
                onCheckedChange={(checked) => handleDayChange(day, "closed", !!checked)}
              />
              <label htmlFor={`closed-${day}`} className="text-sm">Closed</label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
