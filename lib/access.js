/**
 * Created by krasilneg on 16.03.17.
 */
'use strict';

module.exports.nodeAclId = function (node) {
  return 'geonav:::' + (typeof node === 'object' ? node.getCode() + '@' + node.getNamespace() : node);
};
