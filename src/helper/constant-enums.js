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
  NONE: "NONE",
  OTHER: "OTHER"
};
const LANGUAGE = {
  ENGLISH: 'ENGLISH',
  SPANISH: 'SPANISH',
};

module.exports = {
  USER_ROLE,
  STATUS,
  LANGUAGE,
  GRADER,
};
