const FilterGroup = require('../../models/filter-group.model');
const { ErrorHandler } = require('../../utils/error-handler');

const createFilterGroup = async (payload) => {
  try {
    return await FilterGroup.create(payload);
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'filter_group.slug_exists');
    }
    throw new ErrorHandler(500, err.message);
  }
};

const getAllFilterGroups = async (page, limit, filters, sortBy = 'createdAt', order = 'desc') => {
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const sort = {};
  sort[sortBy] = sortOrder;

  const [filterGroups, total] = await Promise.all([
    FilterGroup.find(filters).sort(sort).skip(skip).limit(limit),

    FilterGroup.countDocuments(filters),
  ]);

  return {
    data: filterGroups,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFilterGroupById = async (id) => {
  const filterGroup = await FilterGroup.findById(id);
  if (!filterGroup) throw new ErrorHandler(404, 'filter_group.not_found');
  return filterGroup;
};

const updateFilterGroup = async (id, payload) => {
  try {
    const updated = await FilterGroup.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new ErrorHandler(404, 'filter_group.not_found');

    return updated;
  } catch (err) {
    throw ErrorHandler.from(err);
  }
};
const deleteFilterGroup = async (id) => {
  const deleted = await FilterGroup.findByIdAndDelete(id);
  if (!deleted) throw new ErrorHandler(404, 'filter_group.not_found');
  return true;
};

module.exports = {
  createFilterGroup,
  getAllFilterGroups,
  getFilterGroupById,
  updateFilterGroup,
  deleteFilterGroup,
};
