/**
 * Created by krasilneg on 15.03.17.
 */
'use strict';

const IGeoDataRepository = require('../interfaces/GeoDataRepository');
const Permissions = require('core/Permissions');
const IonError = require('core/IonError');
const Errors = require('../../errors/lib');

// jshint maxstatements: 30

function AclMock() {
  /**
   * @returns {Promise}
   */
  this.checkAccess = function () {
    return Promise.resolve(true);
  };

  /**
   * @param {String} subject
   * @param {String | String[]} resources
   * @returns {Promise}
   */
  this.getPermissions = function (subject, resources) {
    let result = {};
    resources = Array.isArray(resources) ? resources : [resources];
    for (let i = 0; i < resources.length; i++) {
      result[resources[i]] = {};
      result[resources[i]][Permissions.READ] = true;
      result[resources[i]][Permissions.WRITE] = true;
      result[resources[i]][Permissions.DELETE] = true;
      result[resources[i]][Permissions.USE] = true;
      result[resources[i]][Permissions.FULL] = true;
    }
    return Promise.resolve(result);
  };
}

/**
 * @param {{dataRepo: GeoDataRepository}} options
 * @param {AclProvider} [options.acl]
 *
 * @constructor
 */
function SecuredGeoDataRepository(options) {

  var _this = this;

  /**
   * @type {GeoDataRepository}
   */
  var dataRepo = options.data;

  var LAYER_PREFIX = options.layerPrefix || 'geolayer:::';
  var DATA_PREFIX = options.dataPrefix || 'geodata:::';

  /**
   * @type {AclProvider}
   */
  var aclProvider = options.acl || new AclMock();

  /**
   * @param {Layer} layer
   * @returns {String}
   */
  this.layerAclId = function (layer) {
    return LAYER_PREFIX + layer.getCode() + '@' + layer.getNamespace();
  };

  /**
   * @param {DataDescription} query
   * @returns {String}
   */
  this.dataAclId = function (query) {
    let layer = query.getLayer();
    let ind = query.getIndex();
    return DATA_PREFIX + layer.getCode() + '@' + layer.getNamespace() + '@' + ind;
  };

  /**
   * @param {DataDescription} query
   * @param {String} uid
   * @returns {Promise}
   */
  function checkReadAccess(query, uid) {
    let l = query.getLayer();
    let resources = [_this.layerAclId(l), _this.dataAclId(query)];
    return aclProvider.getPermissions(uid, resources)
      .then((perm) => {
        for (let rn in perm) {
          if (perm.hasOwnProperty(rn)) {
            if (perm[rn][Permissions.READ]) {
              return true;
            }
          }
        }
        return false;
      });
  }

  /**
   * Method retrieves data from the specified source (REST or local data repository)
   * corresponding to the specified geographic area and source parameters
   * returns a promise to transfer control to the calling code.
   * Resolve-callback promise takes as input an array of objects of class Item.
   * @param {{x0: Number, y0: Number, x1: Number, y1: Number}} area - geographic area
   * @param {DataDescription} query
   * @param {{user: User}} opts
   * @returns {Promise}
   */
  this._getLayerData = function (area, query, opts) {
    return checkReadAccess(query, opts.user.id())
      .then((accessible) => {
        if (accessible) {
          return dataRepo.getLayerData(area, query, opts);
        }
        throw new IonError(Errors.DENIED);
      });
  };

  /**
   * @param {DataDescription} query
   * @param {String} id
   * @param {{uid: User}} opts
   * @returns {Promise}
   */
  this._getLayerItem = function (query, id, opts) {
    return checkReadAccess(query, opts.user.id())
      .then((accessible) => {
        if (accessible) {
          return dataRepo.getLayerItem(query, id, opts);
        }
        throw new IonError(Errors.DENIED);
      });
  };

  /**
   * @param {DataDescription} query
   * @param {{}} criteria
   * @param {{uid: User}} opts
   * @returns {Promise}
   */
  this._search = function (query, criteria, opts) {
    return checkReadAccess(query, opts.user.id())
      .then(
        (accessible) => {
          if (accessible) {
            return dataRepo.search(query, criteria, opts);
          }
          throw new IonError(Errors.DENIED);
        }
      );
  };
}

SecuredGeoDataRepository.prototype = new IGeoDataRepository();

module.exports = SecuredGeoDataRepository;
