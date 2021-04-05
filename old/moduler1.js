/*!
 * Moduler.js - JavaScript library for binding modules to DOM elements.
 * @version v1.0.0 - 2016-04-27
 * @link https://github.com/simplyio/moduler.js
 */

// setupChangeListeners: function(stickyElement) {
//         if (window.MutationObserver) {
//           var mutationObserver = new window.MutationObserver(function(mutations) {
//             if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
//               methods.setWrapperHeight(stickyElement);
//             }
//           });
//           mutationObserver.observe(stickyElement, {subtree: true, childList: true});
//         } else {
//           stickyElement.addEventListener('DOMNodeInserted', function() {
//             methods.setWrapperHeight(stickyElement);
//           }, false);
//           stickyElement.addEventListener('DOMNodeRemoved', function() {
//             methods.setWrapperHeight(stickyElement);
//           }, false);
//         }
//       },

define(["jquery"], function ($) {
  var Moduler = {};

  Moduler.version = "1.0.0";
  Moduler.debug = false;

  Moduler.options = {
    moduleAttribute: "data-module",
    modulesPath: "modules/",
  };

  Moduler.initialize = function (options) {
    Moduler.debug && console.info("Moduler.initialize");

    Moduler.options = $.extend({}, Moduler.options, options);

    $(function () {
      Moduler.loadModules();
    });
  };

  Moduler.create = function (/* [BaseModule], moduleObj */) {
    var moduleObj, BaseModule;

    if (arguments.length === 2) {
      BaseModule = arguments[0];
      moduleObj = arguments[1];
    } else {
      moduleObj = arguments[0];
    }

    var Module = function Module(element, options, name) {
      if (BaseModule) {
        BaseModule.call(this, element, options, name);
      }

      this.el = element;
      this.$el = $(element);
      this.options = $.extend({}, this.defaults, options);
      this.name = name;
    };

    if (BaseModule) {
      Module.prototype = new BaseModule();
      Module.prototype.constructor = Module;
      Module.prototype.base = BaseModule.prototype; // keep a ref to base instance
      Module.prototype["super"] = function superCall(method, args) {
        this.base[method].apply(this, args);
      };

      for (var key in moduleObj) {
        if (moduleObj.hasOwnProperty(key)) {
          Module.prototype[key] = moduleObj[key];
        }
      }

      Module.prototype.defaults = $.extend(
        {},
        BaseModule.prototype.defaults,
        Module.prototype.defaults
      );
    } else {
      Module.prototype = moduleObj;
    }

    return Module;
  };

  Moduler.loadModules = function (containerElement) {
    Moduler.debug && console.info("Moduler.loadModules");

    var deferred = new $.Deferred(),
      moduleCount = 0,
      finishedLoading = 0;

    if (!containerElement) {
      containerElement = document;
    }

    // find elements with module attribute
    var $modules = $(
      "[" + Moduler.options.moduleAttribute + "]",
      containerElement
    );

    $modules.each(function () {
      var moduleElement = $(this),
        moduleNames = moduleElement
          .attr(Moduler.options.moduleAttribute)
          .split(" ");

      moduleCount += moduleNames.length - 1;

      for (var i in moduleNames) {
        if (!moduleNames[i]) {
          continue;
        }

        var moduleName = moduleNames[i],
          settingsAttr = moduleElement.attr("data-" + moduleName),
          settings = Moduler.utils.parseSettings(settingsAttr),
          modulePath =
            Moduler.options.modulesPath +
            Moduler.utils.toPascalCase(moduleName);

        Moduler.initializeModule(modulePath, moduleName, settings, this)
          .fail(function (reason) {
            // Should we hard fail if a module crashes or swallow it?
            Moduler.debug && console.warn(reason);

            throw new Error('Error in module "' + moduleName + '": ' + reason);
          })
          .always(function () {
            finishedLoading++;

            if (finishedLoading === moduleCount) {
              Moduler.debug && console.debug("All modules loaded");

              deferred.resolve("modules loaded");
            }
          });
      }
    });

    return deferred.promise().done(function () {
      $(document).trigger("modules-ready");
    });
  };

  Moduler.initializeModule = function (
    modulePath,
    moduleName,
    settings,
    moduleElement
  ) {
    var deferred = new $.Deferred();

    Moduler.debug && console.time('initialize module "' + moduleName + '"');

    System["import"](modulePath)
      .then(function (Module) {
        if (typeof settings === "string") {
          deferred.reject(
            'Settings attribute for module "' +
              moduleName +
              '" should be JSON-formated: data-' +
              moduleName +
              '=\'{ "property": "value" }\'. Current value ("' +
              settings +
              '") is not JSON.'
          );
          return;
        }

        if (!Module || !Module.prototype.init) {
          deferred.reject("Failed to load module, missing init? " + moduleName);
        }

        var $moduleElement = $(moduleElement);

        // skip if this module has no name or has already been initialized on this element
        if (!moduleName || $moduleElement.prop("_mo_" + moduleName)) {
          deferred.resolve(moduleName + " already loaded");
          return;
        }

        // mark module as initialized
        $moduleElement.prop("_mo_" + moduleName, "initialized");

        Moduler.debug &&
          console.debug(
            'module "' + moduleName + '" initialized for ',
            moduleElement
          );

        Module.prototype = $.extend({}, Module.prototype);
        var moduleInstance = new Module(moduleElement, settings, moduleName);

        // run init for module
        moduleInstance.init(deferred);

        if (moduleInstance.init.length < 1) {
          deferred.resolve(moduleName + " loaded");
        }

        Moduler.debug &&
          console.timeEnd('initialize module "' + moduleName + '"');
      })
      ["catch"](function (error) {
        deferred.reject("Failed to load modules: " + error);
        throw new Error("Failed to load modules: " + error);
      });

    return deferred.promise();
  };

  Moduler.utils = {
    settingsPropertyRegex: /([\w\-$]+):[\s\d\{\[\'\"\-ftun]/gi, // ftun == false/true/undefined/null
    settingsQuoteRegex: /'/g,

    parseSettings: function (value) {
      if (!value) {
        return null;
      }

      if (value[0] === "{") {
        // is using JSON syntax
        return $.parseJSON(value);
      }

      value = value
        .replace(Moduler.utils.settingsPropertyRegex, '"$1":') // wrap all property names with quotes
        .replace(Moduler.utils.settingsQuoteRegex, '"'); // replace single-quote character with double quotes

      return $.parseJSON("{" + value + "}");
    },

    bindAll: function bindAll(object) {
      if (!object) {
        return console.warn("bindAll requires at least one argument.");
      }

      var toString = Object.prototype.toString,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        functions = Array.prototype.slice.call(arguments, 1);

      if (functions.length === 0) {
        for (var method in object) {
          if (hasOwnProperty.call(object, method)) {
            if (
              typeof object[method] == "function" &&
              toString.call(object[method]) == "[object Function]"
            ) {
              functions.push(method);
            }
          }
        }
      }

      for (var i = 0; i < functions.length; i++) {
        var f = functions[i];
        object[f] = Moduler.utils.bind(object[f], object);
      }
    },

    bind: function bind(func, context) {
      return function () {
        return func.apply(context, arguments);
      };
    },

    getElement: function (selector, $fallbackElement) {
      if (selector == null) {
        return $fallbackElement;
      }
      if (selector.indexOf("$") === -1) {
        return $(selector);
      }

      var regex = /([^\s]+)/g,
        functionWhitelist = [
          "children",
          "first",
          "last",
          "next",
          "nextAll",
          "parent",
          "prev",
          "prevAll",
          "siblings",
        ],
        $query = $(document),
        match = null,
        matchIndex = 0,
        selectorString = "";

      while ((match = regex.exec(selector))) {
        var word = match[1],
          isFunction = word[0] === "$";

        if (matchIndex === 0 && isFunction) {
          $query = $fallbackElement;
        }

        if (isFunction) {
          if (selectorString.length) {
            $query = $query.find(selectorString);
            selectorString = "";
          }

          var functionName = word.substring(1); // remove $ char

          if (
            !(functionName in $query) ||
            $.inArray(functionName, functionWhitelist) === -1
          ) {
            throw new Error(
              'Error while parsing selector: jQuery does not contain a "' +
                functionName +
                '" function or it is not whitelisted.\n Selector: "' +
                selector +
                '"'
            );
          }

          $query = $query[functionName]();
        } else {
          selectorString += word;
        }

        matchIndex = matchIndex + 1;
      }

      return $query;
    },

    toHyphenCase: function (camelCaseString) {
      return camelCaseString.replace(/([A-Z])/g, function (letter) {
        return "-" + letter.toLowerCase();
      });
    },

    toPascalCase: function (value) {
      return value.replace(/(?:^|[\s-])(\w)/g, function (matches, letter) {
        return letter.toUpperCase();
      });
    },
  };

  window.Moduler = Moduler;

  return Moduler;
});
