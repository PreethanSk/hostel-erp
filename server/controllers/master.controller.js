const { col } = require("sequelize");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");

exports.getMasterAmenitiesCategories = async (req, res) => {
  try {
    const response = await db.MasterAmenitiesCategories.findAll();
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};
exports.getMasterAmenitiesSubCategories = async (req, res) => {
  try {
    const response = await db.MasterAmenitiesSubCategories.findAll({
      attributes: {
        include: [[col("MasterAmenitiesCategories.name"), "categoryName"]],
      },
      include: [
        {
          model: db.MasterAmenitiesCategories,
          as: "MasterAmenitiesCategories",
          attributes: [],
        },
      ],
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};
exports.getMasterAmenitiesFacilities = async (req, res) => {
  try {
    const response = await db.MasterAmenitiesFacilities.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
        include: [
          [col("MasterAmenitiesSubCategories.subCategory"), "subCategory"],
        ],
      },
      include: [
        {
          model: db.MasterAmenitiesSubCategories,
          as: "MasterAmenitiesSubCategories",
          attributes: [],
        },
      ],
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getMasterIssueSubCategories = async (req, res) => {
  try {
    const response = await db.MasterIssueSubCategories.findAll({
      attributes: {
        include: [[col("MasterIssueCategories.issueType"), "issueType"]],
      },
      include: [
        {
          model: db.MasterIssueCategories,
          as: "MasterIssueCategories",
          attributes: [],
        },
      ],
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getMasterUserRoles = async (req, res) => {
  try {
    const response = await db.MasterUserRoles.findAll();
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getMasterRoomTypes = async (req, res) => {
  try {
    const response = await db.MasterRoomTypes.findAll();
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getMasterBathroomTypes = async (req, res) => {
  try {
    const response = await db.MasterBathroomType.findAll();
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getMasterCotTypes = async (req, res) => {
  try {
    const response = await db.MasterCotTypes.findAll();
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getMasterSharingTypes = async (req, res) => {
  try {
    const response = await db.MasterSharingTypes.findAll();
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getMasterIssueCategories = async (req, res) => {
  try {
    const response = await db.MasterIssueCategories.findAll();
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getMasterPageLists = async (req, res) => {
  try {
    const response = await db.MasterPageList.findAll();
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterAmenitiesCategories = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      name: req.body.name?.trim(),
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterAmenitiesCategories.findOne({
      where: {
        name: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('name')),
          req.body.name.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Name already exists"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterAmenitiesCategories.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterAmenitiesCategories.create(body);
    }
    if (insertResponse) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success(
          body?.id ? "Updated Successfully" : "Inserted Successfully"
        ));
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterAmenitiesCategory = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Category id is required"));
    }
    const deleted = await db.MasterAmenitiesCategories.destroy({ where: { id }, });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Category not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterAmenitiesSubCategories = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      categoryId: req.body.categoryId,
      subCategory: req.body.subCategory?.trim(),
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterAmenitiesSubCategories.findOne({
      where: {
        subCategory: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('subCategory')),
          req.body.subCategory.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Sub Category Name already exists"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterAmenitiesSubCategories.update(body, {
        where: { id: body?.id },
      });
    } else {
      insertResponse = await db.MasterAmenitiesSubCategories.create(body);
    }
    if (insertResponse) {
      return res
        .status(body?.id ? 200 : 201)
        .json(
          await formatResponse.success(
            body?.id ? "Updated Successfully" : "Inserted Successfully"
          )
        );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterAmenitiesSubCategory = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Subcategory id is required"));
    }
    const deleted = await db.MasterAmenitiesSubCategories.destroy({ where: { id }, });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Subcategory not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterAmenitiesFacilities = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      subCategoryId: req.body.subCategoryId,
      facilityName: req.body.facilityName,
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterAmenitiesFacilities.findOne({
      where: {
        facilityName: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('facilityName')),
          req.body.facilityName.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Facility Name already exists"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterAmenitiesFacilities.update(body, {
        where: { id: body?.id },
      });
    } else {
      insertResponse = await db.MasterAmenitiesFacilities.create(body);
    }
    if (insertResponse) {
      return res
        .status(body?.id ? 200 : 201)
        .json(
          await formatResponse.success(
            body?.id ? "Updated Successfully" : "Inserted Successfully"
          )
        );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterAmenitiesFacility = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Facility id is required"));
    }
    const deleted = await db.MasterAmenitiesFacilities.destroy({ where: { id }, });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Facility not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterRoomTypes = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      type: req.body.type,
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterRoomTypes.findOne({
      where: {
        type: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('type')),
          req.body.type.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Room type already exists"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterRoomTypes.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterRoomTypes.create(body);
    }
    if (insertResponse) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success(body?.id ? "Updated Successfully" : "Inserted Successfully")
      );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterRoomType = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Room type id is required"));
    }
    const deleted = await db.MasterRoomTypes.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Room type not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterBathroomTypes = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      type: req.body.type,
      isActive: req.body.isActive,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterBathroomType.findOne({
      where: {
        type: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('type')),
          req.body.type.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Bathroom type already exists"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterBathroomType.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterBathroomType.create(body);
    }
    if (insertResponse) {
      return res
        .status(body?.id ? 200 : 201)
        .json(
          await formatResponse.success(
            body?.id ? "updated successfully" : "Inserted successfully"
          )
        );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterBathroomType = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Bathroom type id is required"));
    }
    const deleted = await db.MasterBathroomType.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Bathroom type not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterCotTypes = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      type: req.body.type,
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterCotTypes.findOne({
      where: {
        type: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('type')),
          req.body.type.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Cot type already exists"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterCotTypes.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterCotTypes.create(body);
    }
    if (insertResponse) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success(
          body?.id ? "Updated Successfully" : "Inserted Successfully"
        )
      );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterCotType = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Cot type id is required"));
    }
    const deleted = await db.MasterCotTypes.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Cot type not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterSharingTypes = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      type: req.body.type,
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterSharingTypes.findOne({
      where: {
        type: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('type')),
          req.body.type.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Sharing type already exists"));
    }


    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterSharingTypes.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterSharingTypes.create(body);
    }
    if (insertResponse) {
      return res
        .status(body?.id ? 200 : 201)
        .json(
          await formatResponse.success(
            body?.id ? "Updated Successfully" : "Inserted Successfully"
          )
        );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterSharingType = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Sharing type id is required"));
    }
    const deleted = await db.MasterSharingTypes.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Sharing type not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterIssueCategories = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      issueType: req.body.issueType,
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterIssueCategories.findOne({
      where: {
        issueType: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('issueType')),
          req.body.issueType.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Issue type already exists"));
    }


    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterIssueCategories.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterIssueCategories.create(body);
    }
    if (insertResponse) {
      return res
        .status(body?.id ? 200 : 201)
        .json(
          await formatResponse.success(
            body?.id ? "Updated Successfully" : "Inserted Successfully"
          )
        );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterIssueCategory = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Issue category id is required"));
    }
    const deleted = await db.MasterIssueCategories.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Issue category not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterIssueSubCategories = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      issueId: req.body.issueId,
      subCategoryName: req.body.subCategoryName,
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterIssueSubCategories.findOne({
      where: {
        issueId: body.issueId,
        subCategoryName: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('subCategoryName')),
          req.body.subCategoryName.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("This sub-category name already exists under the selected issue category"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterIssueSubCategories.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterIssueSubCategories.create(body);
    }
    if (insertResponse) {
      return res.status(body?.id ? 200 : 201)
        .json(
          await formatResponse.success(
            body?.id ? "Updated Successfully" : "Inserted Successfully"
          )
        );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterIssueSubCategory = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Issue subcategory id is required"));
    }
    const deleted = await db.MasterIssueSubCategories.destroy({ where: { id }, });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Issue subcategory not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterPageLists = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      pageName: req.body.pageName,
      pageURL: req.body.pageURL,
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterPageList.findOne({
      where: {
        pageName: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('pageName')),
          req.body.pageName.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Page name already exists"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterPageList.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterPageList.create(body);
    }
    if (insertResponse) {
      return res
        .status(body?.id ? 200 : 201)
        .json(
          await formatResponse.success(
            body?.id ? "Updated Successfully" : "Inserted Successfully"
          )
        );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterPageList = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Page list id is required"));
    }
    const deleted = await db.MasterPageList.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Page list not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateMasterUserRoles = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      roleName: req.body.roleName || "",
      isActive: req.body.isActive || false,
      notes: req.body.notes || "",
    };

    const existing = await db.MasterUserRoles.findOne({
      where: {
        roleName: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('roleName')),
          body?.roleName?.toLowerCase()
        ),
        ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
      },
    });

    if (existing) {
      return res.status(200).json(await formatResponse.error("Role name already exists"));
    }

    let insertResponse = null;
    if (body?.id) {
      insertResponse = await db.MasterUserRoles.update(body, { where: { id: body?.id }, });
    } else {
      insertResponse = await db.MasterUserRoles.create(body);
      await db.RolePageAccess.create({ id: 0, roleId: insertResponse?.id, isActive: true });
    }
    if (insertResponse) {
      return res.status(body?.id ? 200 : 201)
        .json(
          await formatResponse.success(
            body?.id ? "Updated Successfully" : "Inserted Successfully"
          )
        );
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.deleteMasterUserRole = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("User role id is required"));
    }
    const deleted = await db.MasterUserRoles.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Deleted Successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("User role not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};
