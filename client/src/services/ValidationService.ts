import moment from "moment";

export const requiredFiled = (string: string | null | undefined): boolean => {
    let isValid = true;
    if (string === '' || string === null || string === undefined) {
        isValid = false;
    }

    return isValid;
};

export const validateEmail = (email: string | null | undefined): boolean => {
    let isValid = true;
    if (!String(email)
        .toLowerCase()
        .match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
        isValid = false;
    }

    return isValid;
};
export const validateMobileWithCountryCode = (number: string | null): boolean => {
    let isValid = true;
    number = number || '';
    const pattern = new RegExp(/^\+?(\d{1,4})?[-.\s]?\(?(\d{1,4})\)?[-.\s]?(\d{1,4})[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})$/);
    if (!pattern.test(number)) {
        isValid = false;
    }
    return isValid;
};
export const validateMobile = (number: string | null): boolean => {
    let isValid = true;
    number = number || '';
    if (number?.length < 10 || number?.length > 10) {
        isValid = false;
    }
    return isValid;
};
export const validatePinCode = (number: string | null): boolean => {
    let isValid = true;
    number = number || '';
    if (number?.length < 6 || number?.length > 6) {
        isValid = false;
    }
    return isValid;
};
export const validateAlphanumeric = (address: string | null): boolean => {
    address = address || '';
    const alphaRegex = /[a-zA-Z]/;
    const disallowed = /[!#$%^&*?`|~]/;

    if (disallowed.test(address)) {
        return false;
    }
    if (!isNaN(Number(address))) {
        return false;
    }

    return alphaRegex.test(address);
}
export const validateAadhaar = (aadhaar: string | null): boolean => {
    aadhaar = aadhaar || '';
    const pattern = /^\d{12}$/;
    return pattern.test(aadhaar);
}
export const validatePanCard = (panCard: string | null): boolean => {
    panCard = panCard || '';
    const pattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
    return pattern.test(panCard);
}
export const validateDrivingLicense = (drivingLicense: string | null): boolean => {
    drivingLicense = drivingLicense || '';
    const pattern = /^[A-Z0-9]/;
    return pattern.test(drivingLicense);
}
export const validatePassport = (passport: string | null): boolean => {
    passport = passport || '';
    const pattern = /^[A-Z0-9]{9}$/;
    return pattern.test(passport);
}
export const validateGstNumber = (gstNumber: string | null): boolean => {
    if (!gstNumber || typeof gstNumber !== 'string') {
        return false;
    }

    if (gstNumber.length !== 15) {
        return false;
    }

    const stateCode = gstNumber.slice(0, 2);
    const pan = gstNumber.slice(2, 12);
    const entityCode = gstNumber.slice(12, 13);
    const defNum = gstNumber.slice(13, 14);
    const checkCode = gstNumber.slice(14, 15);

    if (!/^\d{2}$/.test(stateCode)) {
        return false;
    }
    if (!validatePanCard(pan)) {
        return false;
    }
    if (!/^\d$/.test(entityCode)) {
        return false;
    }
    if (defNum !== 'Z') {
        return false;
    }
    if (!/^[A-Z0-9]+$/.test(checkCode)) {
        return false;
    }
    return true;
}

export const validateURL = (email: string | null | undefined): boolean => {
    let isValid = true;

    if (!String(email)
        .toLowerCase()
        .match(
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/g
        )) {
        isValid = false;
    }

    return isValid;
};

export const validateNumber = (number: string | null | undefined, length: number | null = null): boolean => {
    const pattern = new RegExp(/^[0-9\b]+$/);
    let isValid = true;

    number = number || '';

    if (length !== null && number.length !== length) {
        isValid = false;
    }

    if (!pattern.test(number)) {
        isValid = false;
    }

    return isValid;
};

export const validatePhone = (number: string | null | undefined, length: number | null = null): boolean => {
    const pattern = new RegExp(/^\+[0-9\b]+$/);
    let isValid = true;

    number = number || '';

    if (length !== null && number.length !== length) {
        isValid = false;
    }

    if (!pattern.test(number)) {
        isValid = false;
    }

    return isValid;
};

export const validateMobileNumberUniqueness = async (
    candidateRefId: number,
    mobileNumber: string,
    excludeId?: number,
    fieldType?: string
): Promise<{ isValid: boolean; message: string; duplicateFields?: string[]; otherCandidates?: any[] }> => {
    try {
        const { validateCandidateMobileNumberUniqueness } = await import('../models');
        const response = await validateCandidateMobileNumberUniqueness({
            candidateRefId,
            mobileNumber,
            excludeId,
            fieldType
        });

        if (response?.data?.status === 'success') {
            const result = response.data.result;
            return {
                isValid: result.isUnique,
                message: result.message,
                duplicateFields: result.duplicateChecks?.map((d: any) => d.field) || [],
                otherCandidates: result.otherCandidateChecks || []
            };
        }

        return {
            isValid: false,
            message: 'Unable to validate mobile number. Please try again.'
        };
    } catch (error) {
        console.error('Mobile number validation error:', error);
        return {
            isValid: false,
            message: 'Mobile number validation service is currently unavailable. Please try again later.'
        };
    }
};

export const validateEmailUniqueness = async (
    candidateRefId: number,
    email: string,
    excludeId?: number
): Promise<{ isValid: boolean; message: string; duplicateFields?: string[] }> => {
    try {
        const { validateCandidateEmailUniqueness } = await import('../models');
        const response = await validateCandidateEmailUniqueness({
            candidateRefId,
            email,
            excludeId
        });

        if (response?.data?.status === 'success') {
            const result = response.data.result;
            return {
                isValid: result.isUnique,
                message: result.message,
                duplicateFields: result.duplicateChecks?.map((d: any) => d.field) || []
            };
        }

        return {
            isValid: false,
            message: 'Unable to validate email. Please try again.'
        };
    } catch (error) {
        console.error('Email validation error:', error);
        return {
            isValid: false,
            message: 'Email validation service is currently unavailable. Please try again later.'
        };
    }
};

export const validateFloat = (number: string | null | undefined): boolean => {
    const pattern = new RegExp(/^(?!0\d)\d*(\.\d+)?$/);
    let isValid = true;

    number = number || '';

    if (number === '') {
        isValid = false;
    }

    if (!pattern.test(number)) {
        isValid = false;
    }

    return isValid;
};

export const isPastDateValid = (dateString: any) => {
    const inputDate = moment(new Date(dateString), 'YYYY-MM-DD');

    if (inputDate.isValid()) {
        const minDate = moment('1900-12-31', 'YYYY-MM-DD');
        return inputDate.isSameOrAfter(minDate);
    }

    return false;
}

export const isAdultDateValid = (dateString: any) => {
    const dob = moment(new Date(dateString), 'YYYY-MM-DD');
    const age = moment().diff(dob, 'years');
    return age >= 18;
}

interface propString {
    withNumber?: boolean;
    withSpace?: boolean;
    withDash?: boolean;
    withForwardSlash?: boolean;
}

export const validateString = (string: string | null | undefined, config?: propString): boolean => {
    const _configDefault: propString = {
        withNumber: false,
        withDash: false,
        withForwardSlash: false,
        withSpace: true,
    };
    config = { ..._configDefault, ...config };
    let patternStr = "";
    let isValid = true;

    if (config.withNumber) {
        patternStr += "0-9";
    }

    if (config.withDash) {
        patternStr += "-";
    }

    if (config.withForwardSlash) {
        patternStr += "/";
    }

    if (config.withSpace) {
        patternStr += "\\s";
    }

    const pattern = new RegExp("^[a-zA-Z" + patternStr + "]+$", 'gi');
    string = string || '';

    if (!pattern.test(string)) {
        isValid = false;
    }

    return isValid;
};
