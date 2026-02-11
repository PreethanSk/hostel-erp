const { col } = require("sequelize");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");

exports.getRolePageAccessByRoleId = async (req, res) => {
  try {
    const { roleId } = req.query;
    const result = await db.RolePageAccess.findAll({
      attributes: {
        include: [
          [col("MasterPageList.pageName"), "pageName"],
          [col("MasterPageList.pageUrl"), "pageUrl"]
        ],
      },
      include: [
        {
          model: db.MasterPageList,
          as: "MasterPageList",
          attributes: ['pageName']
        }
      ],
      where: { roleId: roleId }
    });
    return res.status(200).json(await formatResponse.success(result));
  }

  catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
}
exports.getRolePageAccess = async (req, res) => {
  try {
    const result = await db.RolePageAccess.findAll({
      attributes: {
        include: [
          [col("MasterUserRoles.roleName"), "roleName"],
          [col("MasterUserRoles.isActive"), "isActive"]
        ],
      },
      include: [
        {
          model: db.MasterUserRoles,
          as: "MasterUserRoles",
          attributes: ['roleName', 'isActive']
        },
        {
          model: db.MasterPageList,
          as: "MasterPageList",
          attributes: ['pageName']
        }
      ],
    });


    const transformedResult = result.reduce((acc, item) => {
      const { roleId, accessLevel, id, pageId, isActive, MasterPageList, MasterUserRoles } = item;
      let roleEntry = acc.find(entry => entry.roleId === roleId);

      if (!roleEntry) {
        roleEntry = { roleId, roleName: MasterUserRoles?.roleName || '', roleStatus: MasterUserRoles.isActive, pages: [] };
        acc.push(roleEntry);
      }

      if (pageId) {
        roleEntry.pages.push({ id, pageId, pageName: MasterPageList?.pageName || '', isActive, accessLevel });
      }

      return acc;
    }, []);
    return res.status(200).json(await formatResponse.success(transformedResult));
  }

  catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
}

exports.insertUpdateRolePageAccess = async (req, res) => {
  try {
    const reqBody = req.body.pages;
    if (!Array.isArray(reqBody) || reqBody.length === 0) {
      return res.status(400).json(await formatResponse.error("Invalid input data"));
    }
    const insertPages = reqBody.filter(item => !item.id);
    const updatePages = reqBody.filter(item => item.id);


    if (insertPages.length > 0) {
      await db.RolePageAccess.bulkCreate(insertPages);
    }

    if (updatePages.length > 0) {
      updateResponses = await Promise.all(
        updatePages.map(async (item) => {
          await db.RolePageAccess.update(item, { where: { id: item.id } });
          return { id: item.id, message: "Updated Successfully" };
        })
      );
    }

    return res.status(200).json(
      await formatResponse.success("Pages Updated Successfully")
    );

  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};