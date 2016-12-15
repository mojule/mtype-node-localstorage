'use strict';

var Adapter = require('./localStorageAdapter');
var Store = require('mtype-node-store');

var LocalStorageStore = function LocalStorageStore(name, options) {
  return Store(name, Object.assign({}, options, { Adapter: Adapter }));
};

module.exports = LocalStorageStore;