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
  BONUS: 'BONUS',
  GIFT: 'GIFT',
  NOTHING: 'NOTHING',
};

const MAX_SPIN_REWARDS = 12;
const APP_TIMEZONE = 'Asia/Kolkata';

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

const CONSTANT_ENUM = {
  STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
  },
  USER_ROLE: {
    ADMIN: 'ADMIN',
    USER: 'USER',
  },
  FIELD_TYPES: {
    TEXT: 'text',
    TEXTAREA: 'textarea',
    NUMBER: 'number',
    EMAIL: 'email',
    PHONE: 'phone',
    DATE: 'date',
    TIME: 'time',
    DATETIME: 'datetime',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    SELECT: 'select',
    MULTISELECT: 'multiselect',
    FILE: 'file',
    IMAGE: 'image',
    URL: 'url',
    PASSWORD: 'password',
    HIDDEN: 'hidden',
    RATING: 'rating',
    RANGE: 'range',
    COLOR: 'color',
  },
  SUBMISSION_STATUS: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    REVIEWED: 'reviewed',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
  },
  CONTENT_SECTION_TYPES: {
    HEADING: 'heading',
    PARAGRAPH: 'paragraph',
    LIST: 'list',
    NOTE: 'note',
    WARNING: 'warning',
    INFO: 'info',
    IMAGE: 'image',
    VIDEO: 'video',
    DIVIDER: 'divider',
  },
  VISIBILITY: {
    PUBLIC: 'public',
    PRIVATE: 'private',
    AUTHENTICATED: 'authenticated',
  },
};

module.exports = {
  CONSTANT_ENUM,
  USER_ROLE,
  STATUS,
  LANGUAGE,
  GRADER,
  FILTER_TYPE,
  VISIBILITY,
  CURRENCY,
  SPIN_REWARD_TYPE,
  MAX_SPIN_REWARDS,
  APP_TIMEZONE,
};
