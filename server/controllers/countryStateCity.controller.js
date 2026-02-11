const fs = require("fs");
const path = require("path");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");

exports.insertUpdateMasterCountry = async (req, res) => {
    try {
        // const filePath = path.join(__dirname, '../json/countries.json');
        // const jsonData = fs.readFileSync(filePath, 'utf8');
        // const parsedData = JSON.parse(jsonData);

        // const reqBody = parsedData.countries;

        const reqBody = req.body.countries;
        if (!Array.isArray(reqBody) || reqBody.length === 0) {
            return res.status(400).json(await formatResponse.error("Invalid input data"));
        }
        const insertData = reqBody.filter(item => !item.id);
        const updateData = reqBody.filter(item => item.id);

        if (insertData.length > 0) {
            await db.MasterCountry.bulkCreate(insertData);
        }

        if (updateData.length > 0) {
            updateResponses = await Promise.all(
                updateData.map(async (item) => {
                    await db.MasterCountry.update(item, { where: { id: item.id } });
                    return { id: item.id, message: "Updated Successfully" };
                })
            );
        }
        return res.status(200).json(
            await formatResponse.success("Updated Successfully")
        );
    }
    catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
}

exports.insertUpdateMasterState = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../json/states_copy.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(jsonData);

        const reqBody = parsedData.states;
        console.log(reqBody[0])
        // const reqBody = req.body.states;
        if (!Array.isArray(reqBody) || reqBody.length === 0) {
            return res.status(400).json(await formatResponse.error("Invalid input data"));
        }

        const insertData = reqBody.map(item => { return { ...item, id: 0 } });
        // const insertData = reqBody.filter(item => !item.id);
        // const updateData = reqBody.filter(item => item.id);

        if (insertData.length > 0) {
            await db.MasterState.bulkCreate(insertData);
        }

        // if (updateData.length > 0) {
        //     updateResponses = await Promise.all(
        //         updateData.map(async (item) => {
        //             await db.MasterState.update(item, { where: { id: item.id } });
        //             return { id: item.id, message: "Updated Successfully" };
        //         })
        //     );
        // }
        return res.status(200).json(
            await formatResponse.success("Updated Successfully")
        );
    }
    catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
}
exports.insertUpdateMasterCity = async (req, res) => {
    try {
        // const filePath = path.join(__dirname, '../json/cities.json');
        // const jsonData = fs.readFileSync(filePath, 'utf8');
        // const parsedData = JSON.parse(jsonData);

        // const reqBody = parsedData.cities;


        const reqBody = req.body.cities;
        if (!Array.isArray(reqBody) || reqBody.length === 0) {
            return res.status(400).json(await formatResponse.error("Invalid input data"));
        }
        const insertData = reqBody.filter(item => !item.id);
        const updateData = reqBody.filter(item => item.id);

        if (insertData.length > 0) {
            await db.MasterCity.bulkCreate(insertData);
        }

        if (updateData.length > 0) {
            updateResponses = await Promise.all(
                updateData.map(async (item) => {
                    await db.MasterCity.update(item, { where: { id: item.id } });
                    return { id: item.id, message: "Updated Successfully" };
                })
            );
        }
        return res.status(200).json(
            await formatResponse.success("Updated Successfully")
        );
    }
    catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
}

exports.getMasterCountry = async (req, res) => {
    try {
        const response = await db.MasterCountry.findAll();
        return res.status(200).json(await formatResponse.success(response));
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
}

exports.getMasterState = async (req, res) => {
    try {
        const response = await db.MasterState.findAll({
            where: { country_id: req.query.countryId }
        });
        return res.status(200).json(await formatResponse.success(response));
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
}

exports.getMasterCity = async (req, res) => {
    try {
        const response = await db.MasterCity.findAll({
            where: { state_id: req.query.stateId }
        });
        return res.status(200).json(await formatResponse.success(response));
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
}
