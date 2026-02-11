const { validationResult } = require('express-validator');
const { formatResponse } = require("./utility.helper");

module.exports.validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const errorFormatter = ({ location, msg, param, value, nestedErrors }) => msg;
        const result = validationResult(req).formatWith(errorFormatter);
        const formatResult = await formatResponse.error(result.mapped());

        res.status(400).json(formatResult);
    };
};

