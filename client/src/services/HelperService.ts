import { useLocation } from "react-router-dom";
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from 'sweetalert2';
import moment from "moment";

export const userSession = (withToken = false) => {
    const _token: string | null = localStorage.getItem('app_login');

    if (_token === null) {
        return null;
    }

    try {
        const user = JSON.parse(atob(_token));
        const response: any = {
            id: user?.id,
            accessToken: user?.accessToken,
            firstName: user?.firstName,
            lastName: user?.lastName,
            emailAddress: user?.emailAddress,
            profilePic: user?.profilePic,
            loginTime: user?.loginTime,
            roleId: user?.roleId,
        };

        if (withToken) {
            response.accessToken = user?.accessToken;
        }

        return response;
    } catch (error) {
        localStorage.clear();
        return null;
    }

};

export function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const base64 = {
    encode(text: string) {
        return btoa(text);
    },
    decode(text: string) {
        return atob(text);
    }
}

export const formatDateToDisplay = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

export const customTableTemplate = {
    border: "none !important"
}

export const customRadio = {
    "&.Mui-checked": { color: "#F76D61" }
}

export const customTableHeader = {
    backgroundColor: "#FAFAFA",
    borderRadius: '10px',
}

export const CustomTableHover = {
    "&:last-child td, &:last-child th": { border: 0 },
    "&:hover": { backgroundColor: "#f4908752" },
    "&:hover td, &:hover th": { color: "#000" },
}

export const textFieldStyleLogin = {
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: '1px solid  #C7C3C3',
            borderRadius: '10px'
        },
        '&:hover fieldset': {
            borderColor: '#1487eb',
        },
        '&.Mui-focused fieldset': {
            border: '2px solid #1487eb'
        },
        backgroundColor: 'white',
    },
    '& .MuiInputBase-input': {
        fontFamily: 'Nunito, sans-serif !important',
        height: '19px',
    },
    '& .MuiInputLabel-outlined': {
        backgroundColor: '#F3F3F3 !important',
        paddingRight: '0.25rem !important',
    },
    '& label.Mui-focused': {
        fontFamily: 'Nunito, sans-serif !important',
        color: '#000 !important',
    },
    'label + &': {
        fontFamily: 'Nunito, sans-serif !important'
    },
}
export const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: '1px solid #F3F3F3',
            borderRadius: '5px',
            borderColor: '#bbbbbb'
        },
        '&:hover fieldset': {
            borderColor: '#DDDDDD',
        },
        '&.Mui-focused fieldset': {
            border: '2px solid #F76D61'
        },
        backgroundColor: '#F3F3F3',
    },
    '& .MuiInputBase-input': {
        fontFamily: 'Nunito, sans-serif !important',
        height: '6px',
        border: '1px solid #F3F3F3',
        borderRadius: '5px',
    },
    '& .MuiInputLabel-outlined': {
        backgroundColor: '#F3F3F3 !important',
        paddingRight: '0.25rem !important',
    },
    '& label.Mui-focused': {
        fontFamily: 'Nunito, sans-serif !important',
        color: '#000 !important',
    },
    'label + &': {
        fontFamily: 'Nunito, sans-serif !important'
    },
}
export const textFieldStyleAssignedby = {
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: 'none',
            borderRadius: '5px',
            borderColor: 'white'
        },
        '&:hover fieldset': {
            borderColor: '',
        },
        '&.Mui-focused fieldset': {
            border: '2px solid #F76D61'
        },
        backgroundColor: 'white',
    },
    '& .MuiInputBase-input': {
        fontFamily: 'Nunito, sans-serif !important',
        height: '10px',
        border: 'none',
    },
    '& .MuiInputLabel-outlined': {
        backgroundColor: '#F3F3F3 !important',
        paddingRight: '0.25rem !important',
    },
    '& label.Mui-focused': {
        fontFamily: 'Nunito, sans-serif !important',
        color: '#000 !important',
    },
    'label + &': {
        fontFamily: 'Nunito, sans-serif !important'
    },
}
export function EncodeUnicode(str: any) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}

export function DecodeUnicode(str: any) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
}


type SweetAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'

export const CustomAlert = (alertType: SweetAlertIcon | undefined, message: string) => {

    return Swal.fire({
        toast: true,
        position: 'bottom-right',
        icon: alertType,
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        showCloseButton: true,
        customClass: {
            popup: 'toast-popup',
            title: 'toast-title',
        }
    })
}


export const DisableKeyUpDown = (e: any) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
    }
}


export const getExportEXCEL = (excelBody: any) => {
    const { header, body, fileName } = excelBody;
    const filename = `${fileName} - ${moment().format("YYYY-MM-DD hh-mm A")}.xlsx`;

    const data = [header, ...body];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const maxColWidths = header.map((_: any, colIdx: number) => {
        const maxLen = Math.max(
            header[colIdx]?.toString()?.length || 10,
            ...body.map((row: any[]) => row[colIdx]?.toString()?.length || 10)
        );
        return { wch: maxLen + 2 };
    });
    worksheet["!cols"] = maxColWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fileName);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", });

    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
};
