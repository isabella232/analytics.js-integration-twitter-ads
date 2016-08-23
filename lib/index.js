'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var defaults = require('@ndhoule/defaults');
var foldl = require('@ndhoule/foldl');
var each = require('component-each');
var get = require('obj-case');

/**
 * Expose `TwitterAds`.
 */

var TwitterAds = module.exports = integration('Twitter Ads')
  .option('page', '')
  .option('universalTagPixelId', '')
  .tag('singleTag', '<img src="//analytics.twitter.com/i/adsct?txn_id={{ pixelId }}&p_id=Twitter&tw_sale_amount={{ revenue }}&tw_order_quantity={{ quantity }}"/>')
  .tag('universalTag', '<script src="//static.ads-twitter.com/uwt.js">')
  .mapping('events');

/**
 * Initialize.
 *
 * @api public
 */

TwitterAds.prototype.initialize = function() {
  var self = this;

  // load universal website tag
  if (this.options.universalTagPixelId) {
    /* eslint-disable */
    (function(e,n,u,a){e.twq||(a=e.twq=function(){a.exe?a.exe.apply(a,arguments):a.queue.push(arguments);},a.version='1',a.queue=[])})(window,document,'script');
    /* eslint-disable */

    this.load('universalTag', function() {
      window.twq('init', self.options.universalTagPixelId);
      self.ready();
    });
  } else {
    this.ready();
  }
};

var defaultQueryValues = {
  revenue: 0,
  quantity: 0
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

TwitterAds.prototype.page = function() {
  if (this.options.universalTagPixelId) {
    window.twq('track', 'PageView');
  } else if (this.options.page) {
    this.load('singleTag', defaults({ pixelId: this.options.page }, defaultQueryValues));
  }
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

TwitterAds.prototype.track = function(track) {
  var events = this.events(track.event());
  var self = this;
  each(events, function(pixelId) {
    self.load('singleTag', defaults({
      pixelId: pixelId,
      quantity: track.proxy('properties.quantity'),
      revenue: track.revenue()
    }, defaultQueryValues));
  });
};

/**
 * Order Completed.
 *
 * @api public
 * @param {Track} track
 */

TwitterAds.prototype.orderCompleted = function(track) {
  var events = this.events(track.event());
  // add up all the quantities of each product
  var quantity = foldl(function(cartQuantity, product) {
    return cartQuantity + (get(product, 'quantity') || 0);
  }, 0, track.products());

  var self = this;
  each(events, function(pixelId) {
    self.load('singleTag', defaults({
      pixelId: pixelId,
      quantity: quantity,
      revenue: track.revenue()
    }, defaultQueryValues));
  });
};
