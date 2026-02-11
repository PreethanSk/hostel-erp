const { AES, enc, format, mode, pad } = require('crypto-js');
const Base64 = require('crypto-js/enc-base64');
const { formatResponse } = require('../../helpers/utility.helper');
const con = require('../../app.config');
require('dotenv').config();

// Decryption Logic
function decryptEas(data, key, iv) {
  const keys = Base64.parse(key);
  const ivs = Base64.parse(iv);
  // convert to binary data
  return AES.decrypt(data, keys, {
    iv: ivs,
    mode: mode.CBC,
    padding: pad.Pkcs7,
    format: format.Hex,
  }).toString(enc.Utf8);
}


const config = {
  GetepayKey: process.env.GetepayKey,
  GetepayIV: process.env.GetepayIV,
};

exports.handleSuccessPayment = async (req, res) => {
  try {
    const result = req.body.response;
    var dataitems = decryptEas(result, config.GetepayKey, config.GetepayIV);
    const parsedData = JSON.parse(dataitems);
    console.log(parsedData)
    res.redirect(`${con.clientHost}/payment-status?endPoint=${btoa(parsedData)}`)
    // res.redirect(`http://localhost:5173/payment-status?endPoint=${btoa(parsedData)}`)
  } catch (error) {
    return res.status(500).json(await formatResponse.error(error));
  }
}
