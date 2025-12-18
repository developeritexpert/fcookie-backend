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



const buildQuestionFormFilters = (query) => {
  const filters = {};

  // Search by title or description
  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  // Filter by status
  if (query.status) {
    filters.status = query.status.toUpperCase();
  }

  // Filter by category
  if (query.category) {
    filters.category = query.category;
  }

  // Filter by visibility
  if (query.visibility) {
    filters.visibility = query.visibility;
  }

  // Filter by created by
  if (query.createdBy) {
    filters.createdBy = query.createdBy;
  }

  return filters;
};

/**
 * Build filters for question submission queries
 * @param {Object} query - Query parameters
 * @returns {Object} MongoDB filter object
 */
const buildSubmissionFilters = (query) => {
  const filters = {};

  // Filter by question form
  if (query.questionForm) {
    filters.questionForm = query.questionForm;
  }

  // Filter by status
  if (query.status) {
    filters.status = query.status;
  }

  // Filter by submission type
  if (query.submissionType) {
    filters.submissionType = query.submissionType;
  }

  // Filter by submitted by user
  if (query.submittedBy) {
    filters.submittedBy = query.submittedBy;
  }

  // Filter by date range
  if (query.startDate || query.endDate) {
    filters.createdAt = {};
    if (query.startDate) {
      filters.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.createdAt.$lte = new Date(query.endDate);
    }
  }

  // Search by guest email or reference number
  if (query.search) {
    filters.$or = [
      { 'guestInfo.email': { $regex: query.search, $options: 'i' } },
      { 'guestInfo.name': { $regex: query.search, $options: 'i' } },
    ];
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
  buildQuestionFormFilters,
  buildSubmissionFilters
};
