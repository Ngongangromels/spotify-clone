import Link from "next/link";
import { IconType } from "react-icons"
import { twMerge } from "tailwind-merge";

interface sidebarItemProps {
    icon: IconType;
    label: string;
    active?: boolean;
    href: string;
}
const SidebarItem: React.FC<sidebarItemProps> = ({icon: Icon, label, active, href}) => {
    return (
        <div>
            <Link 
            href= {href}
            className={twMerge(`
                flex
                flex-rowh-auto
                items-centerw-full
                gap-x-4
                text-emerald-50font-medium
                cursor-pointer
                hover:text-white
                transition
                text-neutral-400
                py-1
                `,
                active && "text-white"
            )}
            >
            <Icon size={26}/>
            <p className="truncate w-full">{label}</p>
            </Link>
            
        </div>
    )
}

export default SidebarItem