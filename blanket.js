'use strict';

require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});
