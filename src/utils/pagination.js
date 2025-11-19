function getPaginationParams(query, defaults = { page: 1, limit: 50, maxLimit: 100 }) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = defaults.page;
  if (isNaN(limit) || limit < 1) limit = defaults.limit;
  if (limit > defaults.maxLimit) limit = defaults.maxLimit;

  return { page, limit };
}
function getFinalPagination(query, fetchAllOverride = false) {
  if (fetchAllOverride || query.all === 'true') {
    return { page: 1, limit: 0 };
  }
  return getPaginationParams(query);
}
function extractFilters(query, allowedFilters, additionalFilters = {}) {
  const filters = {};

  allowedFilters.forEach((key) => {
    const value = query[key];
    if (value !== undefined && value !== null && value !== '') {
      filters[key] = value;
    }
  });

  return Object.assign({}, filters, additionalFilters);
}



const buildCategoryFilters = (query) => {
  const filters = {};

  if (query._id) filters._id = query._id;
  if (query.slug) filters.slug = query.slug;

  if (query.status) filters.status = query.status;

  if (query.name) {
    filters.name = { $regex: query.name, $options: 'i' };
  }

  return filters;
};
const buildSetFilters = (query) => {
  const filters = {};

  if (query._id) filters._id = query._id;
  if (query.categoryId) filters.categoryId = query.categoryId;
  if (query.slug) filters.slug = query.slug;

  if (query.status) filters.status = query.status;

  if (query.name) {
    filters.name = { $regex: query.name, $options: 'i' };
  }

  return filters;
};

module.exports = {
  getPaginationParams,
  getFinalPagination,
  extractFilters,
  buildCategoryFilters,
  buildSetFilters,
};
