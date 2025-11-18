const sendResponseOld = (res, payload, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    ...payload,
    message,
  });
};
// const sendResponse = (
//   res,
//   data = {},
//   message = 'Operation successful',
//   statusCode = 200,
//   extra = {}
// ) => {
//   const response = { data, message, statusCode, ...extra };
//   res.status(statusCode).json(response);
// };

const sendResponse = (
  res,
  data = {},
  messageKey = "common.success",
  statusCode = 200,
  extra = {}
) => {
  const t = res.req.t;

  const translatedMessage = messageKey ? t(messageKey) : "";

  const response = {
    data,
    message: translatedMessage,
    statusCode,
    ...extra,
  };

  return res.status(statusCode).json(response);
};




module.exports = {
  sendResponse,
};
