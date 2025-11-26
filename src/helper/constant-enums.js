const USER_ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  USER: 'USER',
  ADMIN: 'ADMIN',
};
const STATUS = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
};
const VISIBILITY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
};

const CURRENCY = {
  USD: 'USD',
  // EUR: 'EUR',
  // GBP: 'GBP',
  // JPY: 'JPY',
  // AUD: 'AUD',
  // CAD: 'CAD',
  // CHF: 'CHF',
  // CNY: 'CNY',
  // SEK: 'SEK',
  // NZD: 'NZD',
};

const SPIN_REWARD_TYPE = {
  CREDITS: 'CREDITS',
  ITEM: 'ITEM',
  TOKEN: 'TOKEN',
  COUPON: 'COUPON',
};

const GRADER = {
  PSA: 'PSA',
  BGS: 'BGS',
  CGC: 'CGC',
  SGC: 'SGC',
  CGC_COMIC: 'CGC-COMIC',
  CSG: 'CSG',
  AGS: 'AGS',
  GMA: 'GMA',
  HGA: 'HGA',
  BCCG: 'BCCG',
  NONE: 'NONE',
  OTHER: 'OTHER',
};
const LANGUAGE = {
  ENGLISH: 'ENGLISH',
  SPANISH: 'SPANISH',
};
const FILTER_TYPE = {
  SINGLE: 'single',
  MULTI: 'multi',
  NUMBER: 'number',
  TEXT: 'text',
};
module.exports = {
  USER_ROLE,
  STATUS,
  LANGUAGE,
  GRADER,
  FILTER_TYPE,
  VISIBILITY,
  CURRENCY,
  SPIN_REWARD_TYPE,
};
