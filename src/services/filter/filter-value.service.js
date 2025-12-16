const FilterValue = require('../../models/filter-value.model');
const FilterGroup = require('../../models/filter-group.model');
const { ErrorHandler } = require('../../utils/error-handler');
const { clearFilterCache } = require('../../utils/filter-cache');

/**
 * Reorder filter values sequentially within a group
 */
const reorderFilterValues = async (groupId) => {
  const values = await FilterValue.find({ groupId }).sort({ order: 1 });
  let hasChanges = false;

  const bulkOps = [];

  for (let i = 0; i < values.length; i++) {
    if (values[i].order !== i) {
      console.log(`Reordering filter value ${values[i]._id} from ${values[i].order} to ${i}`);
      hasChanges = true;
      bulkOps.push({
        updateOne: {
          filter: { _id: values[i]._id },
          update: { $set: { order: i } }
        }
      });
    }
  }

  if (hasChanges && bulkOps.length > 0) {
    await FilterValue.bulkWrite(bulkOps);
    // ✅ Clear cache after reorder
    console.log('Clearing filter cache after reorder');
    clearFilterCache();
  }

  return hasChanges;
};

/**
 * Bulk reorder filter values
 */
const updateFilterValuesOrder = async (groupId, orderData) => {
  try {
    const groupExists = await FilterGroup.findById(groupId);
    if (!groupExists) {
      throw new ErrorHandler(404, 'filter_group.not_found');
    }

    const valueIds = orderData.map(item => item.id);
    const existingValues = await FilterValue.find({
      _id: { $in: valueIds },
      groupId: groupId
    });

    if (existingValues.length !== valueIds.length) {
      throw new ErrorHandler(400, 'filter_value.invalid_values_for_group');
    }

    const bulkOps = orderData.map(item => ({
      updateOne: {
        filter: { _id: item.id, groupId: groupId },
        update: { $set: { order: item.order } }
      }
    }));

    if (bulkOps.length > 0) {
      await FilterValue.bulkWrite(bulkOps);
      // ✅ Clear cache after reorder
      clearFilterCache();
    }

    const updatedValues = await FilterValue.find({ groupId })
      .populate('groupId', 'name slug type')
      .sort({ order: 1 });

    return updatedValues;
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(500, err.message);
  }
};

const createFilterValue = async (payload) => {
  try {
    const groupExists = await FilterGroup.findById(payload.groupId);
    if (!groupExists) {
      throw new ErrorHandler(404, 'filter_group.not_found');
    }

    // Auto-assign order if not provided
    if (payload.order === undefined) {
      const lastValue = await FilterValue.findOne({ groupId: payload.groupId })
        .sort({ order: -1 });
      payload.order = lastValue ? lastValue.order + 1 : 0;
    }

    const created = await FilterValue.create(payload);
    
    // ✅ Clear cache after create
    clearFilterCache();
    
    return created;
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
    console.log(`cache clear for filter value update ${id}`);
    // ✅ Clear cache after update
      clearFilterCache();
    console.log(`Cleared filter cache after updating filter value ${id}`);
    console.log(`updated filter value ${updated} successfully`);   
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

  // ✅ Reorder (which clears cache internally)
  await reorderFilterValues(deleted.groupId);

  return true;
};

module.exports = {
  createFilterValue,
  getAllFilterValues,
  getFilterValueById,
  updateFilterValue,
  deleteFilterValue,
  updateFilterValuesOrder,
  reorderFilterValues,
};