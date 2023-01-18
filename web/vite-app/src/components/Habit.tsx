import React from "react";

interface HabitProps {
  completed: number;
}

export default function Habit(props: HabitProps) {
  return (
    <div className="bg-zinc-800 w-10 h-10 text-white rounded m-2 flex items-center justify-center">
      {props.completed}
    </div>
  );
}
