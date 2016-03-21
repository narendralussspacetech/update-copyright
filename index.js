/**
 * update-copyright <https://github.com/jonschlinkert/update-copyright>
 *
 * Copyright (c) 2014, Jon Schlinkert.
 * Licensed under the MIT license.
 */

var author = require('./lib/author');
var defaults = require('./lib/defaults');
var template = require('./lib/template');
var utils = require('./lib/utils');

module.exports = function(str, options) {
  var context = {};

  if (typeof str === 'string') {
    var match = utils.parseCopyright(str);
    if (match.length) {
      context = match[0];
    }
  } else {
    options = str;
    str = '';
  }
  options = options || {};
  return updateCopyright(str, context, options);
}

function updateYear(context) {
  return context.dateRange
    ? utils.updateYear(context.dateRange, String(utils.year()))
    : utils.year();
}

function updateCopyright(str, context, options) {
  var pkg = utils.loadPkg.sync(process.cwd());
  var opts = utils.merge({template: template}, options);
  var engine = new utils.Engine(opts);

  // create the template context from defaults, package.json,
  // context from parsing the original statement, and options.
  var ctx = utils.merge({}, defaults, pkg, context, opts);
  ctx.authors = ctx.author = author(ctx, pkg, options);
  ctx.years = ctx.year = updateYear(ctx);

  var statement = ctx.statement;

  // if no original statement was found, create one with the template
  if (typeof statement === 'undefined') {
    return engine.render(opts.template, ctx);
  }

  // necessary since the copyright regex doesn't match
  // the trailing dot. If it does later this is future-proof
  if (statement[statement.length - 1] !== '.') {
    var ch = statement + '.';
    if (str.indexOf(ch) !== -1) {
      statement = ch;
    }
  }

  // create the new copyright statement
  var newStatement = engine.render(opts.template, ctx);

  // if the original string is no more than a copyright statement
  // just return the new one
  if (statement.trim() === str.trim()) {
    return newStatement;
  }

  return str.replace(statement, newStatement);
}


module.exports.parse = utils.parseCopyright;
