import db from "../config/database.config.js";

export const createUpgradeRequest = async (id_user) => {
  try {
    const [request] = await db("upgrade_request")
      .insert({
        id_user,
        status: "pending",
        created_at: new Date()
      })
      .returning("*");

    return request;
  } catch (error) {
    throw error;
  }
};

export const checkExistingRequest = async (id_user) => {
  const request = await db("upgrade_request")
    .where({ id_user })
    .where("status", "pending")
    .first();

  return request;
};

export const getAllUpgradeRequests = async (filter = {}) => {
  let query = db("upgrade_request")
    .select(
      "upgrade_request.id_request",
      "upgrade_request.id_user",
      "upgrade_request.status",
      "upgrade_request.created_at",
      "upgrade_request.reviewed_at",
      "upgrade_request.reviewed_by",
      "user.fullname",
      "user.email",
      "user.role",
      "admin.fullname as admin_name"
    )
    .leftJoin("user", "upgrade_request.id_user", "user.id_user")
    .leftJoin("user as admin", "upgrade_request.reviewed_by", "admin.id_user")

  if (filter.status) {
    query.where("upgrade_request.status", filter.status);
  }

  if (filter.page && filter.limit) {
    const offset = (filter.page - 1) * filter.limit;
    query.offset(offset).limit(filter.limit);
  }

  return query;
};

export const getUpgradeRequestDetail = async (id_request) => {
  const request = await db("upgrade_request")
    .select(
      "upgrade_request.id_request",
      "upgrade_request.id_user",
      "upgrade_request.status",
      "upgrade_request.created_at",
      "upgrade_request.reviewed_at",
      "upgrade_request.reviewed_by",
      "user.fullname",
      "user.email",
      "user.role"
    )
    .leftJoin("user", "upgrade_request.id_user", "user.id_user")
    .where("upgrade_request.id_request", id_request)
    .first();

  return request;
};

export const approveUpgradeRequest = async (id_request, id_admin) => {
  const request = await db("upgrade_request")
    .where("id_request", id_request)
    .first();

  if (!request) return null;

  await db.transaction(async (trx) => {
    // Update request status
    await trx("upgrade_request")
      .where("id_request", id_request)
      .update({
        status: "approved",
        reviewed_at: new Date(),
        reviewed_by: id_admin
      });

    // Update user role to seller
    await trx("user")
      .where("id_user", request.id_user)
      .update({ role: "seller" });
  });

  return getUpgradeRequestDetail(id_request);
};

export const rejectUpgradeRequest = async (id_request, id_admin) => {
  const request = await db("upgrade_request")
    .where("id_request", id_request)
    .first();

  if (!request) return null;

  const [updatedRequest] = await db("upgrade_request")
    .where("id_request", id_request)
    .update({
      status: "rejected",
      reviewed_at: new Date(),
      reviewed_by: id_admin
    })
    .returning("*");

  return updatedRequest;
};

export const getTotalUpgradeRequestPages = async (status = null) => {
  let query = db("upgrade_request");

  if (status) {
    query.where("status", status);
  }

  const count = await query.count("* as count").first();
  return Math.ceil((count?.count || 0) / 5);
};
