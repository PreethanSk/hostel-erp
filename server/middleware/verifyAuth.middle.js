const db = require("../models");
const moment = require("moment");
const { formatResponse } = require("../helpers/utility.helper");
// const client = require("../config/redisConnect");
const userSessionModel = db.UserSessions;

module.exports.verifyToken = async (req, res, next) => {
    try {
        const bearerHeader = req.headers ? req.headers['x-access-token'] || req.headers.authorization : null;

        if (!bearerHeader) {
            return res.status(401).json(await formatResponse.error('Invalid authorization'));
        }

        const bearer = bearerHeader.split(' ');
        if (!(/^Bearer$/i.test(bearer[0])) || bearer.length !== 2) {
            return res.status(401).json(await formatResponse.error('Invalid authorization'));
        }
        const bearerToken = bearer[1];

        const _userSession = await userSessionModel.findOne({ where: { accessToken: bearerToken } });
        if (_userSession?.logoutAt !== null || _userSession === null) {
            return res.status(401).json(await formatResponse.error('Invalid authorization'));
        }

        req.userId = _userSession.userId;
        req.serviceProviderId = _userSession.serviceProviderId;
        req.bearerToken = bearerToken;
        return next();
    } catch (error) {
        console.error('Error in verifyToken middleware:', error);
        if (error.name === 'SequelizeDatabaseError' && error.parent?.code === 'ECONNRESET') {
            return res.status(503).json(await formatResponse.error('Database connection error. Please try again.'));
        }
        return res.status(500).json(await formatResponse.error('Internal server error'));
    }

    // const _tokenDetails = await client.get(bearerToken)
    // if (_tokenDetails) {
    //     console.log('using cached data')
    //     const userSession = await JSON.parse(_tokenDetails)
    //     const dateFormat = 'YYYY-MM-DD HH:mm:ss'
    //     const currentActive = moment().format(dateFormat)
    //     const lastActive = moment(userSession.lastActivity).add('15', 'minutes').format(dateFormat)


    //     const nowDate = moment(lastActive).diff(currentActive, 'minutes');
    //     if (nowDate < 0) {
    //         // await client.del(bearerToken)
    //         // await _userSession.update({ logoutAt: moment().format('YYYY-MM-DD HH:mm:ss') });
    //         return res.status(401).json(await formatResponse.error('authorization is expired'));
    //     } else {
    //         userSession.lastActivity = moment()
    //         console.log('updated cached data')
    //         // await client.set(bearerToken, JSON.stringify(userSession));
    //     }
    // } else {
    //     // await _userSession.update({ logoutAt: moment().format('YYYY-MM-DD HH:mm:ss') });
    //     return res.status(401).json(await formatResponse.error('Invalid authorization Login'));
    // }

    // const userSession = await userSessionModel.findOne({ where: { accessToken: bearerToken } });
  
    // const dateFormat = 'YYYY-MM-DD HH:mm:ss'
    // const currentActive = moment().format(dateFormat)
    // const lastActive = moment(_userSession.lastActivity, dateFormat).add('15', 'minutes')
    // const nowDate = lastActive.diff(currentActive, 'seconds');
    // if (nowDate < 0) {
    //     return res.status(401).json(await formatResponse.error('Invalid authorization token already expired'));
    // }

    // await _userSession.update({ lastActivity: moment().format('YYYY-MM-DD HH:mm:ss') });
}
