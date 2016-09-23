var elementCss = {

  css: function(el) {
    var sheets = document.styleSheets,
      o = [];
    el.matches = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector;
    for (var i in sheets) {
      var rules = sheets[i].rules || sheets[i].cssRules;
      for (var r in rules) {
        if (el.matches(rules[r].selectorText)) {
          o.push(rules[r].cssText);
        }
      }
    }
    return o;
  },

  matchedStyle: function(elem, property) {
    // element property has highest priority
    var val = elem.style.getPropertyValue(property) || null;
    // if it's important, we are done
    if (val && elem.style.getPropertyPriority(property)) {
      return val;
    }

    var rules = window.getMatchedCSSRules ? window.getMatchedCSSRules(elem) : null;
    if (rules) {
      // iterate the rules backwards
      // rules are ordered by priority, highest last
      for (var i = rules.length; i-- > 0;) {
        var r = rules[i];

        var important = r.style.getPropertyPriority(property);

        // if set, only reset if important
        if (val === null || important) {
          val = r.style.getPropertyValue(property);

          // done if important
          if (important) {
            if(val){
              return val;
            }
            break;
          }
        }
      }
    }

    return elementCss.style(elem, property);
  },

  computedStyle: function(el, styleProp) {
    var value, defaultView = (el.ownerDocument || document).defaultView;
    // W3C standard way:
    if (defaultView && defaultView.getComputedStyle) {
      // sanitize property name to css notation
      // (hypen separated words eg. font-Size)
      styleProp = styleProp.replace(/([A-Z])/g, '-$1').toLowerCase();
      return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    } else if (el.currentStyle) { // IE
      // sanitize property name to camelCase
      styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
        return letter.toUpperCase();
      });
      value = el.currentStyle[styleProp];
      // convert other units to pixels on IE
      if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
        return (function(value) {
          var oldLeft = el.style.left,
            oldRsLeft = el.runtimeStyle.left;
          el.runtimeStyle.left = el.currentStyle.left;
          el.style.left = value || 0;
          value = el.style.pixelLeft + 'px';
          el.style.left = oldLeft;
          el.runtimeStyle.left = oldRsLeft;
          return value;
        })(value);
      }
      return value;
    }

    return null;
  },

  style: function(el, styleProp) {

    // elementCss.computedStyle(el, styleProp)
    if (el.currentStyle) {
      return el.currentStyle[styleProp];
    }
    if (window.getComputedStyle) {
      return document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    }
    return elementCss.computedStyle(el, styleProp);

  },

  cleanStyles: function(el) {
    el.setAttribute('style', '');
  },

  setStyle: function(el, obj) {
    for (var i in obj) {
      el.style[i] = obj[i];
    }
  },

  innerHeight: function(el) {
    var h = el.clientHeight;
    var a = ['paddingTop', 'paddingBottom'];

    for (var z = 0, l = a.length; z < l; z++) {
      var m = parseInt(el.style[a[z]], 10);
      if (isNaN(m)) {
        m = 0;
      }
      h -= m;
    }
    return h;
  },

  addCssRule: function(selector, rule) {
    if (document.styleSheets) {
      if (!document.styleSheets.length) {
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(document.createElement('style'));
      }

      var i = document.styleSheets.length - 1;
      var ss = document.styleSheets[i];

      var l = 0;
      if (ss.cssRules) {
        l = ss.cssRules.length;
      } else if (ss.rules) {
        // IE
        l = ss.rules.length;
      }

      if (ss.insertRule) {
        ss.insertRule(selector + ' {' + rule + '}', l);
      } else if (ss.addRule) {
        // IE
        ss.addRule(selector, rule, l);
      }
    }
  },

  index: function(el) {
    var pos = 0;
    while (el !== null) {
      el = el.previousElementSibling;
      pos++;
    }
    return pos;
  },

  boundingRect: function(el){
    return el.getBoundingClientRect();
  },

  clientRect: function(el) {
    var x = 0;
    var y = 0;
    var w = el.clientWidth;
    var h = el.clientHeight;

    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return {
      top: y,
      left: x,
      width: w,
      height: h,
      right: window.innerWidth - (x + w),
      bottom: y + h
    };
  }

};

if(typeof module !== 'undefined'){
  module.exports = elementCss;
}else{
  window.elementCss = elementCss;
}
