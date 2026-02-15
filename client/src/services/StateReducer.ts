import { userSession } from "./HelperService";

export const initialState = {
    user: userSession(),
    branchDetails: null,
    admissionDetails: null,
    pageAccess: null,
    sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
};

const Reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.user
            }
        case 'SET_BRANCH_DETAILS':
            return {
                ...state,
                branchDetails: action.data
            }
        case 'SET_ADMISSION_DETAILS':
            return {
                ...state,
                admissionDetails: action.data
            }
        case 'PAGE_ACCESS':
            return {
                ...state,
                pageAccess: action.data
            }
        case 'TOGGLE_SIDEBAR': {
            const next = !state.sidebarCollapsed;
            localStorage.setItem('sidebarCollapsed', String(next));
            return {
                ...state,
                sidebarCollapsed: next
            }
        }
        default:
            return state;
    }
};

export default Reducer;
