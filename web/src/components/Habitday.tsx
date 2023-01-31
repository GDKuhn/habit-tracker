import React from "react";
import clsx from "clsx";
import * as Popover from "@radix-ui/react-popover";
import ProgressBar from "./ProgressBar";

interface HabitProps {
  amount: number;
  completed: number;
}

export function HabitDay(props: HabitProps) {
  const completedPercentage = Math.round(
    (props.completed / props.amount) * 100
  );

  return (
    <Popover.Root>
      <Popover.Trigger
        className={clsx("w-10 h-10  border-2  rounded-lg", {
          "bg-violet-400 border-violet-300": completedPercentage === 100,
          "bg-violet-500 border-violet-400":
            completedPercentage >= 80 && completedPercentage < 100,
          "bg-violet-600 border-violet-500":
            completedPercentage >= 60 && completedPercentage < 80,
          "bg-violet-700 border-violet-600":
            completedPercentage >= 40 && completedPercentage < 60,
          "bg-violet-800 border-violet-700":
            completedPercentage >= 20 && completedPercentage < 40,
          "bg-violet-900 border-violet-800":
            completedPercentage > 0 && completedPercentage < 20,
          "bg-zinc-900  border-zinc-800": completedPercentage === 0,
        })}
      />

      <Popover.Portal>
        <Popover.Content className="min-w-[320px] p-6 rounded-2xl bg-zinc-900 flex flex-col">
          <span className="font-semibold text-zinc-400">Terça-Feira</span>
          <span className="mt-1 font-extrabold leading-tight text-3xl">
            17/01
          </span>

          <ProgressBar progress={completedPercentage} />

          <Popover.Arrow className="fill-zinc-900" height={8} width={16} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
