const { Category } = require('../../models/category.model');
const { ErrorHandler } = require('../../utils/error-handler');

const createCategory = async ({  }) => {
  const data = await Category.create();

  return {
    data: { data},
    message: "category.create_success",
  };
};


module.exports = {
  register,
  
};
