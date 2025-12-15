let NodeCache;
let filterCache;

try {
  NodeCache = require('node-cache');
  filterCache = new NodeCache({ stdTTL: 300 });
} catch (e) {
  filterCache = null;
}

const clearFilterCache = () => {
  if (filterCache) filterCache.flushAll();
};

const getFilterCache = () => filterCache;

module.exports = {
  getFilterCache,
  clearFilterCache
};
