const FilterValue = require('../../models/filter-value.model');
const FilterGroup = require('../../models/filter-group.model');
const { ErrorHandler } = require('../../utils/error-handler');

const reorderFilterValues = async (groupId) => {
  const values = await FilterValue.find({ groupId }).sort({ order: 1 });

  for (let i = 0; i < values.length; i++) {
    if (values[i].order !== i) {
      values[i].order = i;
      await values[i].save();
    }
  }
};


const createFilterValue = async (payload) => {
  try {
    const groupExists = await FilterGroup.findById(payload.groupId);
    if (!groupExists) {
      throw new ErrorHandler(404, 'filter_group.not_found');
    }

    return await FilterValue.create(payload);
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'filter_value.duplicate_key');
    }
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(500, err.message);
  }
};

const getAllFilterValues = async (page, limit, filters, sortBy = 'createdAt', order = 'desc') => {
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const sort = {};
  sort[sortBy] = sortOrder;

  const [filterValues, total] = await Promise.all([
    FilterValue.find(filters)
      .populate('groupId', 'name slug type')
      .sort(sort)
      .skip(skip)
      .limit(limit),

    FilterValue.countDocuments(filters),
  ]);

  return {
    data: filterValues,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFilterValueById = async (id) => {
  const filterValue = await FilterValue.findById(id).populate('groupId', 'name slug type');
  if (!filterValue) throw new ErrorHandler(404, 'filter_value.not_found');
  return filterValue;
};

const updateFilterValue = async (id, payload) => {
  try {
    if (payload.groupId) {
      const groupExists = await FilterGroup.findById(payload.groupId);
      if (!groupExists) {
        throw new ErrorHandler(404, 'filter_group.not_found');
      }
    }

    const updated = await FilterValue.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate('groupId', 'name slug type');

    if (!updated) throw new ErrorHandler(404, 'filter_value.not_found');
    return updated;
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'filter_value.duplicate_key');
    }
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(500, err.message);
  }
};

const deleteFilterValue = async (id) => {
  const deleted = await FilterValue.findByIdAndDelete(id);
  if (!deleted) throw new ErrorHandler(404, 'filter_value.not_found');

  // 🔥 Reorder values inside this group only
  await reorderFilterValues(deleted.groupId);

  return true;
};


module.exports = {
  createFilterValue,
  getAllFilterValues,
  getFilterValueById,
  updateFilterValue,
  deleteFilterValue,
};
