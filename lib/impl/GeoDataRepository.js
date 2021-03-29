/**
 * Created by kras on 18.08.16.
 */
'use strict';

const IGeoDataRepository = require('../interfaces/GeoDataRepository');
const request = require('request');
const Item = require('core/interfaces/DataRepository/lib/Item');
const ClassMeta = require('core/interfaces/MetaRepository/lib/ClassMeta');
const DataDescription = require('../DataDescription');
const { meta: { parseConditions } } = require('@iondv/meta-model');
const { FunctionCodes: F } = require('@iondv/meta-model-contracts');
const { IonError } = require('@iondv/core');
const Errors = require('../../errors/lib');

const EL_TYPE_MAP = 'map';
const EL_TYPE_INFO = 'info';
const EL_TYPE_SEARCH = 'search';

// jshint maxstatements: 30

function matchOperation(mode) {
  if (mode === DataDescription.MODE_INTERSECT) {
    return F.GEO_INTERSECTS;
  }
  return F.GEO_WITHIN;
}

/**
 * @param {{}} opts
 * @param {{eagerLoading: {map: Array, info: Array}}} q
 * @param {String} [type]
 */
function forceEnrichment(opts, q, type) {
  type = type || EL_TYPE_MAP;
  let props;
  if (opts.requestEagerLoadingProps && opts.requestEagerLoadingProps[q.className] instanceof Array) {
    props = opts.requestEagerLoadingProps[q.className];
  }
  if (q.eagerLoading && q.eagerLoading[type] instanceof Array) {
    props = props ? props.concat(q.eagerLoading[type]) : q.eagerLoading[type];
  }
  if (props instanceof Array) {
    opts.forceEnrichment = [];
    props.forEach(function (p) {
      opts.forceEnrichment.push(p.split('.'));
    });
  }
  return opts;
}

/**
 * @param {{dataRepo: DataRepository, metaRepo: MetaRepository, dataSource: DataSource}} options
 * @constructor
 */
function GeoDataRepository(options) {

  const BOOK = options.coordBook || 'ion_geo_coordbook';

  function list(q, f, result, user) {
    return function () {
      return options.dataRepo.getList(q.className, forceEnrichment({filter: {[F.AND]: f}, user: user}, q, EL_TYPE_MAP))
        .then(function (list) {
          Array.prototype.push.apply(result, list);
        });
    };
  }

  /**
   * @param {Item} item
   * @param {String} type
   * @param {{}} coords
   * @returns {Promise}
   */
  this.bindCoord = function (item, type, coords) {
    if (!options.dataSource) {
      return Promise.reject(new IonError(Errors.NO_DS));
    }
    return options.dataSource.upsert(
      BOOK,
      {
        [F.AND]: [
          {[F.EQUAL]: ['$type', type]},
          {[F.EQUAL]: ['$className', item.getClassName()]},
          {[F.EQUAL]: ['$itemId', item.getItemId()]}
        ]
      },
      {coord: coords}
    );
  };

  function restReq(query, body, single, cb) {
    request({
      url: query.getRestUrl(),
      method: 'post',
      json: true,
      body: body,
      timeout: options.restTimeout || 10000
    }, function (err, data) {
      if (err) {
        return cb(err);
      }

      let classes = {};

      for (let i = 0; i < data.classes.length; i++) {
        classes[data.classes[i].name] = new ClassMeta(data.classes[i]);
      }
      let result;
      if (single) {
        result = new Item(data.item.id, data.item.data, classes[data.item.className]);
        if (data.item.coord) {
          result.coord = data.item.coord;
        }
      } else {
        result = [];
        for (let i = 0; i < data.items.length; i++) {
          let tmp = new Item(data.items[i].id, data.items[i].data, classes[data.items[i].className]);
          if (data.items[i].coord) {
            tmp.coord = data.items[i].coord;
          }
          result.push(tmp);
        }
      }
      cb(null, result);
    });
  }

  /**
   * Method retrieves data from the specified source (REST or local data repository)
   * corresponding to the specified geographic area and source parameters
   * returns a promise to transfer control to the calling code.
   * Resolve-callback promise takes as input an array of objects of class Item.
   * @param {{x0: Number, y0: Number, x1: Number, y1: Number}} area - geographic area
   * @param {DataDescription} query
   * @returns {Promise}
   */
  this._getLayerData = function (area, query, opts) {
    return new Promise(function (resolve, reject) {
      if (typeof query.getRestUrl === 'function') {
        restReq(
          query,
          {
            area: [[area.x0, area.y0], [area.x1, area.y1]],
            hierarchy: []
          },
          false,
          function (err, result) {
            return err ? reject(err) : resolve(result);
          }
        );
      } else if (typeof query.getQuery === 'function') {
        let q = query.getQuery();
        // Take into account the nested levels of data - MAYBE FUNCTIONAL DOES NOT NEED
        let qc = q.queryConditions;
        if (Array.isArray(qc)) {
          qc = parseConditions(qc, options.metaRepo.getMeta(q.className));
        }
        if (typeof query.getLocationAttribute === 'function') {
          let locationFilter = {
            [matchOperation(query.getMatchMode())]: [
              '$' + query.getLocationAttribute(),
              {
                type: 'Polygon',
                coordinates: [
                  [[area.x0, area.y0], [area.x1, area.y0], [area.x1, area.y1], [area.x0, area.y1], [area.x0, area.y0]]
                ]
              }
            ]
          };
          return options.dataRepo.getList(q.className,
            forceEnrichment({
              filter: qc ? {[F.AND]: [qc, locationFilter]} : locationFilter,
              user: opts.user,
              requestEagerLoadingProps: opts.requestEagerLoadingProps
            }, q, EL_TYPE_MAP))
            .then(resolve)
            .catch(reject);
        } else if (typeof query.getCoordType === 'function') {
          if (!options.dataSource) {
            return reject(new IonError(Errors.NO_DS));
          }
          let locationFilter = {
            [F.AND]: [
              {[F.EQUAL]: ['$type', query.getCoordType()]},
              {[F.EQUAL]: ['$className', q.className]},
              {[matchOperation(query.getMatchMode())]: [
                '$coord',
                {
                  type: 'Polygon',
                  coordinates: [
                    [[area.x0, area.y0], [area.x1, area.y0], [area.x1, area.y1], [area.x0, area.y1], [area.x0, area.y0]]
                  ]
                }
              ]}
            ]
          };
          let bindedCoords = {};
          return options.dataSource.fetch(BOOK, {filter: locationFilter})
            .then(function (items) {
              bindedCoords = {};
              var fltrs = [];
              var idf = [];
              for (var i = 0; i < items.length; i++) {
                idf.push(items[i].itemId);
                bindedCoords[items[i].className + '@' + items[i].itemId] = items[i].coord;
                if (i % 200 === 0 || i === items.length - 1) {
                  fltrs.push({$ItemId: idf});
                  idf = [];
                }
              }
              return Promise.resolve(fltrs);
            }).then(function (fltrs) {
              var result = [];
              var getter = null;
              for (var i = 0; i < fltrs.length; i++) {
                let f = [fltrs[i]];
                if (qc) {
                  if (Array.isArray(qc)) {
                    Array.prototype.push.apply(f, qc);
                  } else {
                    f.push(qc);
                  }
                }
                if (getter) {
                  getter = getter.then(list(q, f, result, opts.user));
                } else {
                  getter = list(q, f, result, opts.user)();
                }
              }

              if (getter) {
                return getter.then(function () {
                  result.forEach(
                    /**
                     * @param {Item} i
                     */
                    function (i) {
                      if (bindedCoords.hasOwnProperty(i.getClassName() + '@' + i.getItemId())) {
                        i.coord = bindedCoords[i.getClassName() + '@' + i.getItemId()];
                      }
                    }
                  );
                  return Promise.resolve(result);
                });
              }
              return Promise.resolve(result);
            }).then(resolve).catch(reject);
        } else {
          reject(new IonError(Errors.WRONG_QUERY));
        }
      }
    });
  };

  /**
   * @param {DataDescription} query
   * @param {String} id
   * @returns {Promise}
   */
  this._getLayerItem = function (query, id, opts) {
    return new Promise(function (resolve, reject) {
      if (typeof query.getRestUrl === 'function') {
        restReq(
          query,
          {id: id},
          true,
          function (err, result) {
            return err ? reject(err) : resolve(result);
          }
        );
      } else if (typeof query.getQuery === 'function') {
        let q = query.getQuery();
        let opts2 = {user: opts.user};
        /*
        if (q.queryConditions) {
          let qc = parseConditions(q.queryConditions, options.metaRepo.getMeta(q.className));
          if (qc) {
            opts2.filter = qc;
          }
        }
        */
        return options.dataRepo.getItem(q.className, id, forceEnrichment(opts2, q, EL_TYPE_INFO))
            .then(function (result) {
              if (typeof query.getCoordType === 'function') {
                if (!options.dataSource) {
                  return reject(new IonError(Errors.NO_DS));
                }
                options.dataSource.get(BOOK,
                  {
                    [F.AND]: [
                      {[F.EQUAL]: ['$type', query.getCoordType()]},
                      {[F.EQUAL]: ['$className', result.getClassName()]},
                      {[F.EQUAL]: ['$itemId', result.getItemId()]}
                    ]
                  }
                ).then(
                  function (c) {
                    if (c) {
                      result.coord = c.coord;
                    }
                    return Promise.resolve(result);
                  }
                );
              }
              return Promise.resolve(result);
            })
          .then(resolve)
          .catch(reject);
      } else {
        reject(new IonError(Errors.WRONG_QUERY));
      }
    });
  };

  function getCoords(coordType, cn, list) {
    return function () {
      return options.dataSource.fetch(BOOK,
        {
          [F.AND]: [
            {[F.EQUAL]: ['$type', coordType]},
            {[F.EQUAL]: ['$className', cn]},
            {[F.IN]: ['$itemId', list.ids]}
          ]
        }
      ).then(
        function (coords) {
          if (coords) {
            coords.forEach(function (coord) {
              list.map[coord.itemId].coord = coord.coord;
            });
          }
          return Promise.resolve();
        }
      );
    };
  }

  /**
   * @param {DataDescription} query
   * @param {{}} criteria
   * @returns {Promise}
   */
  this._search = function (query, criteria, opts) {
    return new Promise(function (resolve, reject) {
      if (typeof query.getRestUrl === 'function') {
        restReq(
          query,
          {search: criteria},
          false,
          function (err, result) {return err ? reject(err) : resolve(result);}
        );
      } else if (typeof query.getQuery === 'function') {
        let q = query.getQuery();
        let f = criteria;
        if (q.queryConditions) {
          let qc = parseConditions(q.queryConditions, options.metaRepo.getMeta(q.className));
          if (qc) {
            f = {[F.AND]: [criteria, qc]};
          }
        }
        return options.dataRepo.getList(q.className, forceEnrichment({filter: f, user: opts.user}, q, EL_TYPE_SEARCH))
          .then(function (result) {
            if (typeof query.getCoordType === 'function') {
              if (!options.dataSource) {
                return reject(new IonError(Errors.NO_DS));
              }

              let coordLists = {};
              result.forEach(function (item) {
                if (!coordLists.hasOwnProperty(item.getClassName())) {
                  coordLists[item.getClassName()] = {ids: [], map: {}};
                }
                coordLists[item.getClassName()].ids.push(item.getItemId());
                coordLists[item.getClassName()].map[item.getItemId()] = item;
              });

              let p;
              for (let cn in coordLists) {
                if (coordLists.hasOwnProperty(cn)) {
                  if (p) {
                    p = p.then(getCoords(query.getCoordType(), cn, coordLists[cn]));
                  } else {
                    p = getCoords(query.getCoordType(), cn, coordLists[cn])();
                  }
                }
              }

              if (!p) {
                return Promise.resolve(result);
              }
              return p.then(function () {
                return Promise.resolve(result);
              });
            }
            return Promise.resolve(result);
          })
          .then(resolve)
          .catch(reject);
      } else {
        reject(new IonError(Errors.WRONG_QUERY));
      }
    });
  };

  this.init = function () {
    if (options.dataSource) {
      return options.dataSource.ensureIndex(BOOK, {type: 1, className: 1, itemId: 1}, {unique: true})
        .then(function () {
          return options.dataSource.ensureIndex(BOOK, {coord: '2dsphere', type: 1, className: 1});
        });
    }
    return Promise.resolve();
  };
}

GeoDataRepository.prototype = new IGeoDataRepository();

module.exports = GeoDataRepository;
