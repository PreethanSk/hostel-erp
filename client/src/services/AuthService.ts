import { base64 } from "./HelperService";

export const insertUpdateLocalStorage = (storeKey: string, data: any) => {
    const _temp: any = JSON.parse(localStorage.getItem(storeKey) || 'null');
    localStorage.setItem(storeKey, JSON.stringify({ ..._temp, ...data }));
}
export const getLocalStorage = (storeKey: string) => {
    return JSON.parse(localStorage.getItem(storeKey) || 'null');
}

export const removeLocalStorage = (storeKey: string) => {
    localStorage.removeItem(storeKey);
}


export const authService = {
    setUser() {
        const _tempData = {};
        return _tempData;
    },
    removeUser() {
        localStorage.removeItem('app_login');
        return null;
    },
    user() {
        const _tempData: string | null = localStorage.getItem('app_login');
        if (!_tempData) return null;

        try {
            const user = JSON.parse(base64.decode(_tempData));
            return {
                id: user?.id,
                accessToken: user?.accessToken,
                firstName: user?.firstName,
                lastName: user?.lastName,
                emailAddress: user?.emailAddress,
                profilePic: user?.profilePic,
                loginTime: user?.loginTime,
                roleId: user?.roleId,
                branchId: user?.branchId,
                branchName: user?.branchName,
            };
        } catch (error) {
            localStorage.clear();
            return null;
        }
    }
}
