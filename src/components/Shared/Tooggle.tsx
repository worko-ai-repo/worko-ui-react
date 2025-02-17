import { Switch } from '@headlessui/react'
/**
 * ToggleBtnProps
 * 
 * @description - This will be the props for the ToggleBtn component
 */
interface ToggleBtnProps {
  isToggleEnabled:boolean
  setIsToggleEnabled:React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * ToggleBtn
 * 
 * @description - This will be the Toggle Button component will be used to toggle the state of the button, The state for this component must be stored by the parent componenet and managedby the child component. 
 * 
 * @state  isToggleEnabled 
 * @stateUpdator  setIsToggleEnabled
 */
export default function ToggleBtn(prop:ToggleBtnProps) {

  return (
    <Switch
      checked={prop.isToggleEnabled}
      onChange={prop.setIsToggleEnabled}
      className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none  data-[checked]:bg-blue-600"
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
      />
    </Switch>
  )
}
