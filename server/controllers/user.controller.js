const crypto = require('crypto');

const _generateUniqueId = async () => {
    const uuid = crypto.randomBytes(50).toString('hex');
    let userData = await transactionSummaryModel.count({ where: { uniqueId: uuid } });

    if (userData === 0) {
        return uuid;
    } else {
        return await _generateUniqueId();
    }
};

exports.test = async (req, res, next) => {
    res.json('success');
    next();
};