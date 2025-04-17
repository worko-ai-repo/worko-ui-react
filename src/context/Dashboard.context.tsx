import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import secureStorage from "@Utils/SecureStorage.utils";
import { Star } from "lucide-react";
import { createContext, ReactNode, useState, useContext, useEffect } from "react";

type Tab =
    | 'home'
    | 'jobs'
    | 'invites'
    | 'applicants'
    | 'interviews'
    | 'hire'
    | 'bulk-cv-check'
    | 'referrals'
    | 'invoice-&-payment'
    | 'support';

interface DashboardContextType {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    breadcrumb: ReactNode;
    user: CognitoUserDetails | null;
}

interface CognitoUserDetails {
    aud: string;
    auth_time: number;
    'cognito:groups'?: string[];
    'cognito:username': string;
    email: string;
    email_verified: boolean;
    event_id: string;
    exp: number;
    iat: number;
    iss: string;
    jti: string;
    name: string;
    origin_jti: string;
    phone_number: string;
    phone_number_verified: boolean;
    sub: string;
    token_use: 'id';
  }
  

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [user, setUser] = useState<CognitoUserDetails | null>(null);

    useEffect(() => {
        const userDetails = secureStorage.getItem(SecureStorageKeyEnum.COGNITOUSERDETAILS);
        if(userDetails) setUser(userDetails as CognitoUserDetails);
    }, [])

    const breadcrumb: ReactNode = (
        <div className="flex items-center text-sm text-gray-500 space-x-2 truncate">
            <Star className="text-[#316bff] w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Dashboards</span>
            <span>/</span>
            <span className="font-medium text-black capitalize">{activeTab}</span>
        </div>
    )

    return (
        <DashboardContext.Provider value={{ activeTab, setActiveTab, breadcrumb, user }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
};
