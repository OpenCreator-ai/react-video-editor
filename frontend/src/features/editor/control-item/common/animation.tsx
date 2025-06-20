import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IAnimation } from "../types";

function Animation({
  label,
  value,
  onChange,
}: {
  label: string;
  value: IAnimation;
  onChange: (v: IAnimation) => void;
}) {
  const [localValue, setLocalValue] = useState<IAnimation>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const directions = [
    { value: "up", label: "向上" },
    { value: "down", label: "向下" },
    { value: "left", label: "向左" },
    { value: "right", label: "向右" }
  ];

  const timings = [
    { value: "ease", label: "平滑" },
    { value: "ease-in", label: "渐入" },
    { value: "ease-out", label: "渐出" },
    { value: "ease-in-out", label: "渐入渐出" },
    { value: "linear", label: "线性" }
  ];

  return (
    <div className="flex flex-col gap-2 py-4">
      <Label className="font-sans text-xs font-semibold text-primary">
        {label}
      </Label>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center text-sm text-muted-foreground">
          速度
        </div>
        <div className="relative w-32">
          <Input
            variant="secondary"
            className="h-8"
            value={localValue.speed}
            onChange={(e) => {
              const newValue = e.target.value;

              if (
                newValue === "" ||
                (!isNaN(Number(newValue)) && Number(newValue) >= 0)
              ) {
                setLocalValue((prev) => ({
                  ...prev,
                  speed: (newValue === ""
                    ? ""
                    : Number(newValue)) as unknown as number,
                }));

                if (newValue !== "") {
                  onChange({
                    ...localValue,
                    speed: Number(newValue),
                  });
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center text-sm text-muted-foreground">
          方向
        </div>
        <div className="relative w-32">
          <Select
            value={localValue.direction}
            onValueChange={(value) => {
              setLocalValue((prev) => ({
                ...prev,
                direction: value,
              }));
              onChange({
                ...localValue,
                direction: value,
              });
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="选择方向" />
            </SelectTrigger>
            <SelectContent>
              {directions.map((dir) => (
                <SelectItem key={dir.value} value={dir.value}>
                  {dir.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center text-sm text-muted-foreground">
          时间函数
        </div>
        <div className="relative w-32">
          <Select
            value={localValue.timing}
            onValueChange={(value) => {
              setLocalValue((prev) => ({
                ...prev,
                timing: value,
              }));
              onChange({
                ...localValue,
                timing: value,
              });
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="选择时间函数" />
            </SelectTrigger>
            <SelectContent>
              {timings.map((timing) => (
                <SelectItem key={timing.value} value={timing.value}>
                  {timing.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default Animation; 