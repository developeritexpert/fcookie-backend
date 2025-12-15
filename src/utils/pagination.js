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
  console.log("inner quer",query)
  const filters = {};

  if (query.status && query.status !== "all") {
    filters.status = query.status.toUpperCase();
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filters.$or = [
      { name: searchRegex },
      { slug: searchRegex },
      { description: searchRegex }
    ];
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
const buildFilterGroupFilters = (query) => {
  const filters = {};

  // Handle search - search in name and slug fields
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filters.$or = [
      { name: searchRegex },
      { slug: searchRegex }
    ];
  }

  // Handle specific name filter
  if (query.name && query.name.trim() && !query.search) {
    filters.name = new RegExp(query.name.trim(), 'i');
  }

  // Handle slug filter
  if (query.slug && query.slug.trim()) {
    filters.slug = new RegExp(query.slug.trim(), 'i');
  }

  // Handle type filter
  if (query.type) {
    filters.type = query.type;
  }

  // Handle status filter
  if (query.status) {
    filters.status = query.status;
  }

  // Handle archived filter
  if (query.archived !== undefined) {
    filters.archived = query.archived === 'true' || query.archived === true;
  }

  // Handle required filter
  if (query.required !== undefined) {
    filters.required = query.required === 'true' || query.required === true;
  }

  // Handle protected filter
  if (query.protected !== undefined) {
    filters.protected = query.protected === 'true' || query.protected === true;
  }

  return filters;
};

const buildFilterValueFilters = (query) => {
  const filters = {};

  // Handle groupId filter
  if (query.groupId) {
    filters.groupId = query.groupId;
  }

  // Handle search - search in label and valueKey fields
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filters.$or = [
      { label: searchRegex },
      { valueKey: searchRegex }
    ];
  }

  // Handle specific label filter
  if (query.label && query.label.trim()) {
    filters.label = new RegExp(query.label.trim(), 'i');
  }

  // Handle valueKey filter
  if (query.valueKey && query.valueKey.trim()) {
    filters.valueKey = new RegExp(query.valueKey.trim(), 'i');
  }

  // Handle status filter
  if (query.status) {
    filters.status = query.status;
  }

  // Handle archived filter
  if (query.archived !== undefined) {
    filters.archived = query.archived === 'true' || query.archived === true;
  }

  return filters;
};


const buildAssetFilters = (query = {}) => {
  const filters = {};

  if (query.search) {
  filters.name = { $regex: query.search, $options: "i" };

  }

  if (query.categoryId) {
    filters.categoryId = query.categoryId;
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.visibility) {
    filters.visibility = query.visibility;
  }

  if (query.minPrice || query.maxPrice) {
    filters.listing_price = {};
    if (query.minPrice) filters.listing_price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.listing_price.$lte = Number(query.maxPrice);
  }


  if (query.filters) {
    try {
      const parsed = typeof query.filters === 'string'
        ? JSON.parse(query.filters)
        : query.filters;

      if (Array.isArray(parsed) && parsed.length) {
        filters.$and = parsed.map(f => ({
          filters: { $elemMatch: { groupId: f.groupId, valueId: f.valueId } },
        }));
      }
    } catch (_) {}
  }

  return filters;
};

module.exports = {
  getPaginationParams,
  getFinalPagination,
  extractFilters,
  buildCategoryFilters,
  buildSetFilters,
  buildFilterGroupFilters,
  buildFilterValueFilters,
  buildAssetFilters,
};
