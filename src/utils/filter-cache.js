// filterCache.js
const NodeCache = require('node-cache');

const filterCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});

const clearFilterCache = () => {
  console.log('[CACHE] Flushing filter cache');
  filterCache.flushAll();
};

const getFilterCache = () => filterCache;

module.exports = {
  getFilterCache,
  clearFilterCache,
};
