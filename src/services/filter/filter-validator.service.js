const mongoose = require('mongoose');
const FilterGroup = require('../../models/filter-group.model');
const FilterValue = require('../../models/filter-value.model');
const { ErrorHandler } = require('../../utils/error-handler');

async function validateSingleFilter(filter) {
  const { groupId, valueId } = filter;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ErrorHandler(400, 'asset.invalid_filter_groupId');
  }

  if (!mongoose.Types.ObjectId.isValid(valueId)) {
    throw new ErrorHandler(400, 'asset.invalid_filter_valueId');
  }

  const group = await FilterGroup.findById(groupId);
  if (!group) {
    throw new ErrorHandler(404, 'filter_group.not_found');
  }

  const value = await FilterValue.findById(valueId);
  if (!value) {
    throw new ErrorHandler(404, 'filter_value.not_found');
  }

  if (String(value.groupId) !== String(groupId)) {
    throw new ErrorHandler(400, 'filter_value_not_in_group');
  }

  return true;
}

async function validateFiltersArray(filters = []) {
  if (!Array.isArray(filters)) {
    throw new ErrorHandler(400, 'asset.invalid_filters_format');
  }

  for (const f of filters) {
    await validateSingleFilter(f);
  }

  return true;
}

module.exports = {
  validateFiltersArray,
  validateSingleFilter,
};
