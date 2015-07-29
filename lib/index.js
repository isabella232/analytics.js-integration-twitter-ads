
/**
 * Module dependencies.
 */

var each = require('each');
var integration = require('analytics.js-integration');

/**
 * Expose `TwitterAds`.
 */

var TwitterAds = module.exports = integration('Twitter Ads')
  .option('page', '')
  .tag('<img src="//analytics.twitter.com/i/adsct?txn_id={{ pixelId }}&p_id=Twitter"/>')
  .mapping('events')
  .mapping('paths');

/**
 * Initialize.
 *
 * @api public
 */

TwitterAds.prototype.initialize = function() {
  this.ready();
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

TwitterAds.prototype.page = function(page) {
  var paths = this.paths(page.path());
  var self = this;

  // send explicitly mapped pixel(s), if any.
  each(paths, function(pixelId) {
    self.load({ pixelId: pixelId });
  });

  // send generic "pageview" pixel, if configured.
  if (this.options.page) {
    this.load({ pixelId: this.options.page });
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
    self.load({ pixelId: pixelId });
  });
};
