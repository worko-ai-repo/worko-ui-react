import { Switch } from '@headlessui/react'

interface ToggleBtnProps {
  isToggleEnabled: boolean;
  setIsToggleEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  inactiveBgColor?: string; // Custom color for inactive background
  activeBgColor?: string; // Custom color for active background
  inactiveDialColor?: string; // Custom color for inactive dial
  activeDialColor?: string; // Custom color for active dial
}

export default function ToggleBtn({
  isToggleEnabled,
  setIsToggleEnabled,
  inactiveBgColor = "bg-gray-200", // Default inactive bg
  activeBgColor = "bg-blue-600", // Default active bg
  inactiveDialColor = "bg-white", // Default inactive dial
  activeDialColor = "bg-white", // Default active dial
}: ToggleBtnProps) {
  return (
    <Switch
      checked={isToggleEnabled}
      onChange={setIsToggleEnabled}
      className={`group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
        ${isToggleEnabled ? activeBgColor : inactiveBgColor}`}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out
          ${isToggleEnabled ? activeDialColor : inactiveDialColor} 
          ${isToggleEnabled ? "translate-x-5" : "translate-x-0"}`}
      />
    </Switch>
  );
}
