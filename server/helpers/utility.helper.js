const moment = require('moment');

module.exports.generatePassword = async (passwordLength = 12) => {
    const chars = "0123456789#abcdefghilkmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let password = "";

    for (let i = 0; i <= passwordLength; i++) {
        const randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
    }

    return password;
};

module.exports.formatResponse = {
    async success(result = null, status = 'success') {
        return await _formatResponse(status, null, result);
    },
    async error(result = null, status = 'error') {
        return await _formatResponse(status, result, null);
    }
}

const _formatResponse = async (status = 'success', error = null, result = null) => {
    return {
        timestamp: moment(),
        status: status,
        error: error,
        result: result
    }
}

module.exports.getKeyByValue = async (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
}

