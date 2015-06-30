
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var defaults = require('defaults');
var foldl = require('foldl');
var each = require('each');
var get = require('obj-case');

/**
 * Expose `TwitterAds`.
 */

var TwitterAds = module.exports = integration('Twitter Ads')
  .option('page', '')
  .tag('<img src="//analytics.twitter.com/i/adsct?txn_id={{ pixelId }}&p_id=Twitter&tw_sale_amount={{ revenue }}&tw_order_quantity={{ quantity }}"/>')
  .mapping('events');

/**
 * Initialize.
 *
 * @api public
 */

TwitterAds.prototype.initialize = function() {
  this.ready();
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
  if (this.options.page) {
    this.load(defaults({ pixelId: this.options.page }, defaultQueryValues));
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
    self.load(defaults({
      pixelId: pixelId,
      quantity: track.proxy('properties.quantity'),
      revenue: track.revenue()
    }, defaultQueryValues));
  });
};

/**
 * Completed Order.
 *
 * @api public
 * @param {Track} track
 */

TwitterAds.prototype.completedOrder = function(track) {
  var events = this.events(track.event());
  // add up all the quantities of each product
  var quantity = foldl(function(cartQuantity, product) {
    return cartQuantity + (get(product, 'quantity') || 0);
  }, 0, track.products());

  var self = this;
  each(events, function(pixelId) {
    self.load(defaults({
      pixelId: pixelId,
      quantity: quantity,
      revenue: track.revenue()
    }, defaultQueryValues));
  });
};
