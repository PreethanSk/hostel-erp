module.exports.getPagination = (page, size) => {
    const limit = size ? +size : 20;
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
};

module.exports.getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: results } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, totalPages, currentPage, results };
};
