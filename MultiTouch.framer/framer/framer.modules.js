require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"MultiTouchEvents":[function(require,module,exports){
var LayerPinch, _angles, _distances, _fingers, _midPoints,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Events.Pinch = "pinch";

Events.PinchEnd = "pinchend";

_fingers = [];

_distances = [];

_angles = [];

_midPoints = [];

exports.LayerMultiTouchGesture = (function(superClass) {
  extend(LayerMultiTouchGesture, superClass);

  function LayerMultiTouchGesture(options) {
    if (options == null) {
      options = {};
    }
    LayerMultiTouchGesture.__super__.constructor.call(this, options);
  }

  LayerMultiTouchGesture.define("pinch", {
    get: function() {
      return this._pinch != null ? this._pinch : this._pinch = new LayerPinch(this);
    },
    set: function() {
      if (_isBoolean(value)) {
        return this.pinch.enabled = value;
      }
    }
  });

  return LayerMultiTouchGesture;

})(Framer.Layer);

window.Layer = exports.LayerMultiTouchGesture;

LayerPinch = (function(superClass) {
  extend(LayerPinch, superClass);

  LayerPinch.define("propagateEvents", LayerPinch.simpleProperty("propagateEvents", true));

  function LayerPinch(layer1) {
    this.layer = layer1;
    this._endValues = bind(this._endValues, this);
    this._pinchEnd = bind(this._pinchEnd, this);
    this._pinch = bind(this._pinch, this);
    this._pinchStart = bind(this._pinchStart, this);
    LayerPinch.__super__.constructor.apply(this, arguments);
    this.enabled = true;
    this.attach();
  }

  LayerPinch.prototype.attach = function() {
    return this.layer.on(Events.TouchStart, this._pinchStart);
  };

  LayerPinch.prototype._pinchStart = function(event) {
    this._fingers = event.targetTouches.length;
    if (this._fingers >= 2 && Utils.isMobile()) {
      document.addEventListener(Events.TouchMove, this._pinch);
      return document.addEventListener(Events.TouchEnd, this._pinchEnd);
    }
  };

  LayerPinch.prototype._pinch = function(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    if (!this.propagateEvents) {
      event.stopPropagation();
    }
    this._isPinching = true;
    this._fingers = event.targetTouches.length;
    if (this._fingers >= 2) {
      this._calculateDistance(event, this);
      this._calculateDirection(this);
      this._calculateAngle(event, this);
      this._calculateMidPoint(event, this);
      return this.layer.emit(Events.Pinch, event);
    }
  };

  LayerPinch.prototype._pinchEnd = function(event) {
    if (event.targetTouches.length <= 0 && this._isPinching) {
      document.removeEventListener(Events.TouchMove, this._pinch);
      this._endValues(this);
      this.layer.emit(Events.PinchEnd, event);
      return this._isPinching = false;
    }
  };

  LayerPinch.prototype._calculateDistance = function(event, layer) {
    var distance, length, points, touches;
    length = event.targetTouches.length - 1;
    touches = event.targetTouches;
    points = {
      x: Math.pow(touches[length].pageX - touches[0].pageX, 2),
      y: Math.pow(touches[length].pageY - touches[0].pageY, 2)
    };
    distance = Math.sqrt(points.x + points.y);
    _distances.push(distance);
    return layer._distance = _distances.slice(-1)[0] - _distances.slice(0, 1)[0];
  };

  LayerPinch.prototype._calculateDirection = function(layer) {
    var _direction;
    _direction = _distances.slice(-1)[0] - _distances.slice(-2, -1)[0];
    return layer._direction = _direction > 0 ? "outward" : "inward";
  };

  LayerPinch.prototype._calculateAngle = function(event, layer) {
    var angle, length, line, touches;
    length = event.targetTouches.length - 1;
    touches = event.targetTouches;
    line = {
      rise: touches[0].pageY - touches[length].pageY,
      run: touches[0].pageX - touches[length].pageX
    };
    angle = Math.atan(line.rise / line.run) * (180 / Math.PI);
    _angles.push(angle);
    return layer._angle = _angles.slice(-1)[0] - _angles.slice(0, 1)[0];
  };

  LayerPinch.prototype._calculateMidPoint = function(event, layer) {
    var i, len, midPoint, ref, touch, x, y;
    x = 0;
    y = 0;
    ref = event.targetTouches;
    for (i = 0, len = ref.length; i < len; i++) {
      touch = ref[i];
      x += touch.pageX;
      y += touch.pageY;
    }
    midPoint = {
      x: x / event.targetTouches.length,
      y: y / event.targetTouches.length
    };
    _midPoints.push(midPoint);
    layer._midPoint = _midPoints.slice(-1)[0];
    return layer._midPointDistance = _midPoints.slice(-1)[0] - _midPoints.slice(0, 1)[0];
  };

  LayerPinch.prototype._endValues = function(layer) {
    layer._previousDistance = layer._distance = _distances.slice(-1)[0] - _distances.slice(0, 1)[0];
    layer._previousAngle = layer._angle = _angles.slice(-1)[0] - _angles.slice(0, 1)[0];
    layer._previousMidPoint = layer._midPoint = _midPoints.slice(-1)[0];
    layer._previousMidPointDistance = _midPoints.slice(-1)[0] - _midPoints.slice(0, 1)[0];
    _fingers = [];
    _distances = [];
    _angles = [];
    return _midPoints = [];
  };

  LayerPinch.define("fingers", {
    get: function() {
      return this._fingers || 0;
    }
  });

  LayerPinch.define("distance", {
    get: function() {
      return this._distance || 0;
    }
  });

  LayerPinch.define("previousDistance", {
    get: function() {
      return this._previousDistance || 0;
    }
  });

  LayerPinch.define("direction", {
    get: function() {
      return this._direction || 0;
    }
  });

  LayerPinch.define("angle", {
    get: function() {
      return this._angle || 0;
    }
  });

  LayerPinch.define("previousAngle", {
    get: function() {
      return this._previousAngle || 0;
    }
  });

  LayerPinch.define("midPoint", {
    get: function() {
      return this._midPoint || 0;
    }
  });

  LayerPinch.define("previousMidPoint", {
    get: function() {
      return this._previousMidPoint || 0;
    }
  });

  LayerPinch.define("midPointDistance", {
    get: function() {
      return this._midPointDistance || 0;
    }
  });

  LayerPinch.define("previousMidPointDistance", {
    get: function() {
      return this._previousMidPointDistance || 0;
    }
  });

  return LayerPinch;

})(Framer.BaseClass);



},{}],"MultiTouchEvents":[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var LayerPinch, _angles, _distances, _fingers, _midPoints,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Events.Pinch = "pinch";

Events.PinchEnd = "pinchend";

_fingers = [];

_distances = [];

_angles = [];

_midPoints = [];

exports.LayerMultiTouchGesture = (function(superClass) {
  extend(LayerMultiTouchGesture, superClass);

  function LayerMultiTouchGesture(options) {
    if (options == null) {
      options = {};
    }
    LayerMultiTouchGesture.__super__.constructor.call(this, options);
  }

  LayerMultiTouchGesture.define("pinch", {
    get: function() {
      return this._pinch != null ? this._pinch : this._pinch = new LayerPinch(this);
    },
    set: function() {
      if (_isBoolean(value)) {
        return this.pinch.enabled = value;
      }
    }
  });

  return LayerMultiTouchGesture;

})(Framer.Layer);

window.Layer = exports.LayerMultiTouchGesture;

LayerPinch = (function(superClass) {
  extend(LayerPinch, superClass);

  LayerPinch.define("propagateEvents", LayerPinch.simpleProperty("propagateEvents", true));

  function LayerPinch(layer1) {
    this.layer = layer1;
    this._endValues = bind(this._endValues, this);
    this._pinchEnd = bind(this._pinchEnd, this);
    this._pinch = bind(this._pinch, this);
    this._pinchStart = bind(this._pinchStart, this);
    LayerPinch.__super__.constructor.apply(this, arguments);
    this.enabled = true;
    this.attach();
  }

  LayerPinch.prototype.attach = function() {
    return this.layer.on(Events.TouchStart, this._pinchStart);
  };

  LayerPinch.prototype._pinchStart = function(event) {
    this._fingers = event.targetTouches.length;
    if (this._fingers >= 2 && Utils.isMobile()) {
      document.addEventListener(Events.TouchMove, this._pinch);
      return document.addEventListener(Events.TouchEnd, this._pinchEnd);
    }
  };

  LayerPinch.prototype._pinch = function(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    if (!this.propagateEvents) {
      event.stopPropagation();
    }
    this._isPinching = true;
    this._fingers = event.targetTouches.length;
    if (this._fingers >= 2) {
      this._calculateDistance(event, this);
      this._calculateDirection(this);
      this._calculateAngle(event, this);
      this._calculateMidPoint(event, this);
      return this.layer.emit(Events.Pinch, event);
    }
  };

  LayerPinch.prototype._pinchEnd = function(event) {
    if (event.targetTouches.length <= 0 && this._isPinching) {
      document.removeEventListener(Events.TouchMove, this._pinch);
      this._endValues(this);
      this.layer.emit(Events.PinchEnd, event);
      return this._isPinching = false;
    }
  };

  LayerPinch.prototype._calculateDistance = function(event, layer) {
    var distance, length, points, touches;
    length = event.targetTouches.length - 1;
    touches = event.targetTouches;
    points = {
      x: Math.pow(touches[length].pageX - touches[0].pageX, 2),
      y: Math.pow(touches[length].pageY - touches[0].pageY, 2)
    };
    distance = Math.sqrt(points.x + points.y);
    _distances.push(distance);
    return layer._distance = _distances.slice(-1)[0] - _distances.slice(0, 1)[0];
  };

  LayerPinch.prototype._calculateDirection = function(layer) {
    var _direction;
    _direction = _distances.slice(-1)[0] - _distances.slice(-2, -1)[0];
    return layer._direction = _direction > 0 ? "outward" : "inward";
  };

  LayerPinch.prototype._calculateAngle = function(event, layer) {
    var angle, length, line, touches;
    length = event.targetTouches.length - 1;
    touches = event.targetTouches;
    line = {
      rise: touches[0].pageY - touches[length].pageY,
      run: touches[0].pageX - touches[length].pageX
    };
    angle = Math.atan(line.rise / line.run) * (180 / Math.PI);
    _angles.push(angle);
    return layer._angle = _angles.slice(-1)[0] - _angles.slice(0, 1)[0];
  };

  LayerPinch.prototype._calculateMidPoint = function(event, layer) {
    var i, len, midPoint, ref, touch, x, y;
    x = 0;
    y = 0;
    ref = event.targetTouches;
    for (i = 0, len = ref.length; i < len; i++) {
      touch = ref[i];
      x += touch.pageX;
      y += touch.pageY;
    }
    midPoint = {
      x: x / event.targetTouches.length,
      y: y / event.targetTouches.length
    };
    _midPoints.push(midPoint);
    layer._midPoint = _midPoints.slice(-1)[0];
    return layer._midPointDistance = _midPoints.slice(-1)[0] - _midPoints.slice(0, 1)[0];
  };

  LayerPinch.prototype._endValues = function(layer) {
    layer._previousDistance = layer._distance = _distances.slice(-1)[0] - _distances.slice(0, 1)[0];
    layer._previousAngle = layer._angle = _angles.slice(-1)[0] - _angles.slice(0, 1)[0];
    layer._previousMidPoint = layer._midPoint = _midPoints.slice(-1)[0];
    layer._previousMidPointDistance = _midPoints.slice(-1)[0] - _midPoints.slice(0, 1)[0];
    _fingers = [];
    _distances = [];
    _angles = [];
    return _midPoints = [];
  };

  LayerPinch.define("fingers", {
    get: function() {
      return this._fingers || 0;
    }
  });

  LayerPinch.define("distance", {
    get: function() {
      return this._distance || 0;
    }
  });

  LayerPinch.define("previousDistance", {
    get: function() {
      return this._previousDistance || 0;
    }
  });

  LayerPinch.define("direction", {
    get: function() {
      return this._direction || 0;
    }
  });

  LayerPinch.define("angle", {
    get: function() {
      return this._angle || 0;
    }
  });

  LayerPinch.define("previousAngle", {
    get: function() {
      return this._previousAngle || 0;
    }
  });

  LayerPinch.define("midPoint", {
    get: function() {
      return this._midPoint || 0;
    }
  });

  LayerPinch.define("previousMidPoint", {
    get: function() {
      return this._previousMidPoint || 0;
    }
  });

  LayerPinch.define("midPointDistance", {
    get: function() {
      return this._midPointDistance || 0;
    }
  });

  LayerPinch.define("previousMidPointDistance", {
    get: function() {
      return this._previousMidPointDistance || 0;
    }
  });

  return LayerPinch;

})(Framer.BaseClass);

},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];



},{}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaG10dWNrZXIvR2l0SHViL011bHRpVG91Y2hFdmVudHMvTXVsdGlUb3VjaC5mcmFtZXIvbW9kdWxlcy9NdWx0aVRvdWNoRXZlbnRzLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2pvc2htdHVja2VyL0dpdEh1Yi9NdWx0aVRvdWNoRXZlbnRzL011bHRpVG91Y2guZnJhbWVyL21vZHVsZXMvTXVsdGlUb3VjaEV2ZW50cy5qcyIsIi9Vc2Vycy9qb3NobXR1Y2tlci9HaXRIdWIvTXVsdGlUb3VjaEV2ZW50cy9NdWx0aVRvdWNoLmZyYW1lci9tb2R1bGVzL215TW9kdWxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEscURBQUE7RUFBQTs7a0ZBQUE7O0FBQUEsTUFBTSxDQUFDLEtBQVAsR0FBZSxPQUFmLENBQUE7O0FBQUEsTUFDTSxDQUFDLFFBQVAsR0FBa0IsVUFEbEIsQ0FBQTs7QUFBQSxRQUdBLEdBQVcsRUFIWCxDQUFBOztBQUFBLFVBSUEsR0FBYSxFQUpiLENBQUE7O0FBQUEsT0FLQSxHQUFVLEVBTFYsQ0FBQTs7QUFBQSxVQU1BLEdBQWEsRUFOYixDQUFBOztBQUFBLE9BUWEsQ0FBQztBQUNiLDRDQUFBLENBQUE7O0FBQWEsRUFBQSxnQ0FBQyxPQUFELEdBQUE7O01BQUMsVUFBUTtLQUNyQjtBQUFBLElBQUEsd0RBQU0sT0FBTixDQUFBLENBRFk7RUFBQSxDQUFiOztBQUFBLEVBR0Esc0JBQUMsQ0FBQSxNQUFELENBQVEsT0FBUixFQUNDO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO21DQUFHLElBQUMsQ0FBQSxTQUFELElBQUMsQ0FBQSxTQUFjLElBQUEsVUFBQSxDQUFXLElBQVgsRUFBbEI7SUFBQSxDQUFMO0FBQUEsSUFDQSxHQUFBLEVBQUssU0FBQSxHQUFB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlOQSxPQUFPLENBQUMsS0FBUixHQUFnQixZQUFoQixDQUFBOztBQUFBLE9BRU8sQ0FBQyxVQUFSLEdBQXFCLFNBQUEsR0FBQTtTQUNwQixLQUFBLENBQU0sdUJBQU4sRUFEb0I7QUFBQSxDQUZyQixDQUFBOztBQUFBLE9BS08sQ0FBQyxPQUFSLEdBQWtCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBTGxCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiRXZlbnRzLlBpbmNoID0gXCJwaW5jaFwiXG5FdmVudHMuUGluY2hFbmQgPSBcInBpbmNoZW5kXCJcblxuX2ZpbmdlcnMgPSBbXVxuX2Rpc3RhbmNlcyA9IFtdXG5fYW5nbGVzID0gW11cbl9taWRQb2ludHMgPSBbXVxuXG5jbGFzcyBleHBvcnRzLkxheWVyTXVsdGlUb3VjaEdlc3R1cmUgZXh0ZW5kcyBGcmFtZXIuTGF5ZXJcblx0Y29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXHRcdHN1cGVyIG9wdGlvbnNcblxuXHRAZGVmaW5lIFwicGluY2hcIixcblx0XHRnZXQ6IC0+IEBfcGluY2ggPz0gbmV3IExheWVyUGluY2goQClcblx0XHRzZXQ6IC0+IEBwaW5jaC5lbmFibGVkID0gdmFsdWUgaWYgX2lzQm9vbGVhbih2YWx1ZSlcblxuIyBSZXBsYWNlIExheWVyIHdpdGggTGF5ZXJNdWx0aVRvdWNoR2VzdHVyZVxud2luZG93LkxheWVyID0gZXhwb3J0cy5MYXllck11bHRpVG91Y2hHZXN0dXJlXG5cbmNsYXNzIExheWVyUGluY2ggZXh0ZW5kcyBGcmFtZXIuQmFzZUNsYXNzXG5cdEBkZWZpbmUgXCJwcm9wYWdhdGVFdmVudHNcIiwgQHNpbXBsZVByb3BlcnR5KFwicHJvcGFnYXRlRXZlbnRzXCIsIHRydWUpXG5cdFxuXG5cdGNvbnN0cnVjdG9yOiAoQGxheWVyKSAtPlxuXHRcdHN1cGVyXG5cblx0XHRAZW5hYmxlZCA9IHRydWVcblxuXHRcdEBhdHRhY2goKVxuXG5cdGF0dGFjaDogLT5cblx0XHRAbGF5ZXIub24gRXZlbnRzLlRvdWNoU3RhcnQsIEBfcGluY2hTdGFydFxuXG5cdF9waW5jaFN0YXJ0OiAoZXZlbnQpID0+XG5cdFx0QF9maW5nZXJzID0gZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGhcblxuXHRcdGlmIEBfZmluZ2VycyA+PSAyIGFuZCBVdGlscy5pc01vYmlsZSgpXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKEV2ZW50cy5Ub3VjaE1vdmUsIEBfcGluY2gpXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKEV2ZW50cy5Ub3VjaEVuZCwgQF9waW5jaEVuZClcblxuXHRfcGluY2g6IChldmVudCkgPT5cblx0XHRyZXR1cm4gdW5sZXNzIEBlbmFibGVkXG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkgdW5sZXNzIEBwcm9wYWdhdGVFdmVudHNcblxuXHRcdEBfaXNQaW5jaGluZyA9IHRydWVcblxuXHRcdEBfZmluZ2VycyA9IGV2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoXG5cblx0XHRpZiBAX2ZpbmdlcnMgPj0gMlxuXG5cdFx0XHQjIERpc3RhbmNlXG5cdFx0XHRAX2NhbGN1bGF0ZURpc3RhbmNlKGV2ZW50LCBAKVxuXG5cdFx0XHQjIERpcmVjdGlvblxuXHRcdFx0QF9jYWxjdWxhdGVEaXJlY3Rpb24oQClcblxuXHRcdFx0IyBBbmdsZVxuXHRcdFx0QF9jYWxjdWxhdGVBbmdsZShldmVudCwgQClcblxuXHRcdFx0IyBNaWRwb2ludFxuXHRcdFx0QF9jYWxjdWxhdGVNaWRQb2ludChldmVudCwgQClcblxuXHRcdFx0QGxheWVyLmVtaXQoRXZlbnRzLlBpbmNoLCBldmVudClcblxuXHRfcGluY2hFbmQ6IChldmVudCkgPT5cblx0XHRpZiBldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA8PSAwIGFuZCBAX2lzUGluY2hpbmdcblxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudHMuVG91Y2hNb3ZlLCBAX3BpbmNoKVxuXG5cdFx0XHRAX2VuZFZhbHVlcyhAKVxuXG5cdFx0XHRAbGF5ZXIuZW1pdChFdmVudHMuUGluY2hFbmQsIGV2ZW50KVxuXG5cdFx0XHRAX2lzUGluY2hpbmcgPSBmYWxzZVxuXG5cdF9jYWxjdWxhdGVEaXN0YW5jZTogKGV2ZW50LCBsYXllcikgLT5cblx0XHRsZW5ndGggPSBldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCAtIDFcblx0XHR0b3VjaGVzID0gZXZlbnQudGFyZ2V0VG91Y2hlc1xuXG5cdFx0cG9pbnRzID0gXG5cdFx0XHR4OiBNYXRoLnBvdyh0b3VjaGVzW2xlbmd0aF0ucGFnZVggLSB0b3VjaGVzWzBdLnBhZ2VYLCAyKVxuXHRcdFx0eTogTWF0aC5wb3codG91Y2hlc1tsZW5ndGhdLnBhZ2VZIC0gdG91Y2hlc1swXS5wYWdlWSwgMilcblxuXHRcdGRpc3RhbmNlID0gTWF0aC5zcXJ0KHBvaW50cy54ICsgcG9pbnRzLnkpXG5cdFx0X2Rpc3RhbmNlcy5wdXNoKGRpc3RhbmNlKVxuXHRcdGxheWVyLl9kaXN0YW5jZSA9IF9kaXN0YW5jZXNbLTEuLi0xXVswXSAtIF9kaXN0YW5jZXNbMC4uMF1bMF1cblxuXHRfY2FsY3VsYXRlRGlyZWN0aW9uOiAobGF5ZXIpIC0+XG5cdFx0X2RpcmVjdGlvbiA9IF9kaXN0YW5jZXNbLTEuLi0xXVswXSAtIF9kaXN0YW5jZXNbLTIuLi0yXVswXVxuXG5cdFx0bGF5ZXIuX2RpcmVjdGlvbiA9IGlmIF9kaXJlY3Rpb24gPiAwIHRoZW4gXCJvdXR3YXJkXCIgZWxzZSBcImlud2FyZFwiXG5cblxuXHRfY2FsY3VsYXRlQW5nbGU6IChldmVudCwgbGF5ZXIpIC0+XG5cdFx0bGVuZ3RoID0gZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggLSAxXG5cdFx0dG91Y2hlcyA9IGV2ZW50LnRhcmdldFRvdWNoZXNcblxuXHRcdGxpbmUgPSBcblx0XHRcdHJpc2U6IHRvdWNoZXNbMF0ucGFnZVkgLSB0b3VjaGVzW2xlbmd0aF0ucGFnZVlcblx0XHRcdHJ1bjogdG91Y2hlc1swXS5wYWdlWCAtIHRvdWNoZXNbbGVuZ3RoXS5wYWdlWFxuXG5cdFx0YW5nbGUgPSBNYXRoLmF0YW4obGluZS5yaXNlL2xpbmUucnVuKSAqICgxODAvTWF0aC5QSSlcblx0XHRfYW5nbGVzLnB1c2goYW5nbGUpXG5cdFx0bGF5ZXIuX2FuZ2xlID0gX2FuZ2xlc1stMS4uLTFdWzBdIC0gX2FuZ2xlc1swLi4wXVswXVxuXG5cdF9jYWxjdWxhdGVNaWRQb2ludDogKGV2ZW50LCBsYXllcikgLT5cblx0XHR4ID0gMFxuXHRcdHkgPSAwXG5cdFx0XG5cdFx0Zm9yIHRvdWNoIGluIGV2ZW50LnRhcmdldFRvdWNoZXNcblx0XHRcdHggKz0gdG91Y2gucGFnZVhcblx0XHRcdHkgKz0gdG91Y2gucGFnZVlcblxuXHRcdG1pZFBvaW50ID0gXG5cdFx0XHR4OiB4L2V2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoXG5cdFx0XHR5OiB5L2V2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoXG5cblx0XHRfbWlkUG9pbnRzLnB1c2gobWlkUG9pbnQpXG5cdFx0bGF5ZXIuX21pZFBvaW50ID0gX21pZFBvaW50c1stMS4uLTFdWzBdXG5cdFx0bGF5ZXIuX21pZFBvaW50RGlzdGFuY2UgPSBfbWlkUG9pbnRzWy0xLi4tMV1bMF0gLSBfbWlkUG9pbnRzWzAuLjBdWzBdXG5cblxuXHRfZW5kVmFsdWVzOiAobGF5ZXIpID0+XG5cdFx0bGF5ZXIuX3ByZXZpb3VzRGlzdGFuY2UgPSBsYXllci5fZGlzdGFuY2UgPSBfZGlzdGFuY2VzWy0xLi4tMV1bMF0gLSBfZGlzdGFuY2VzWzAuLjBdWzBdXG5cdFx0bGF5ZXIuX3ByZXZpb3VzQW5nbGUgPSBsYXllci5fYW5nbGUgPSBfYW5nbGVzWy0xLi4tMV1bMF0gLSBfYW5nbGVzWzAuLjBdWzBdXG5cdFx0bGF5ZXIuX3ByZXZpb3VzTWlkUG9pbnQgPSBsYXllci5fbWlkUG9pbnQgPSBfbWlkUG9pbnRzWy0xLi4tMV1bMF1cblx0XHRsYXllci5fcHJldmlvdXNNaWRQb2ludERpc3RhbmNlID0gX21pZFBvaW50c1stMS4uLTFdWzBdIC0gX21pZFBvaW50c1swLi4wXVswXVxuXG5cdFx0IyBUT0RPOiBJcyBpdCBuZWNlc3NhcnkgdG8gY2xlYXIgdGhlc2U/IFdvdWxkIHRoZXJlIGJlIGEgcmVhc29uIHRvIGtlZXAgdGhlaXIgdmFsdWVzP1xuXHRcdCMgV291bGRuJ3QgcmVxdWlyZSBzdG9yaW5nIHByZXZpb3VzIHZhbHVlcyBmb3IgbW9kdWxhdGUsIGJ1dCBtYXkgcnVuIGludG8gb3RoZXIgcHJvYmxlbXNcblxuXHRcdF9maW5nZXJzID0gW11cblx0XHRfZGlzdGFuY2VzID0gW11cblx0XHRfYW5nbGVzID0gW11cblx0XHRfbWlkUG9pbnRzID0gW11cblxuXHRAZGVmaW5lIFwiZmluZ2Vyc1wiLCBnZXQ6IC0+IEBfZmluZ2VycyBvciAwXG5cblx0QGRlZmluZSBcImRpc3RhbmNlXCIsIGdldDogLT4gQF9kaXN0YW5jZSBvciAwXG5cdEBkZWZpbmUgXCJwcmV2aW91c0Rpc3RhbmNlXCIsIGdldDogLT4gQF9wcmV2aW91c0Rpc3RhbmNlIG9yIDBcblxuXHRAZGVmaW5lIFwiZGlyZWN0aW9uXCIsIGdldDogLT4gQF9kaXJlY3Rpb24gb3IgMFxuXG5cblx0QGRlZmluZSBcImFuZ2xlXCIsIGdldDogLT4gQF9hbmdsZSBvciAwXG5cdEBkZWZpbmUgXCJwcmV2aW91c0FuZ2xlXCIsIGdldDogLT4gQF9wcmV2aW91c0FuZ2xlIG9yIDBcblxuXHRAZGVmaW5lIFwibWlkUG9pbnRcIiwgZ2V0OiAtPiBAX21pZFBvaW50IG9yIDBcblx0QGRlZmluZSBcInByZXZpb3VzTWlkUG9pbnRcIiwgZ2V0OiAtPiBAX3ByZXZpb3VzTWlkUG9pbnQgb3IgMFxuXHRAZGVmaW5lIFwibWlkUG9pbnREaXN0YW5jZVwiLCBnZXQ6IC0+IEBfbWlkUG9pbnREaXN0YW5jZSBvciAwXG5cdEBkZWZpbmUgXCJwcmV2aW91c01pZFBvaW50RGlzdGFuY2VcIiwgZ2V0OiAtPiBAX3ByZXZpb3VzTWlkUG9pbnREaXN0YW5jZSBvciAwXG5cblxuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIExheWVyUGluY2gsIF9hbmdsZXMsIF9kaXN0YW5jZXMsIF9maW5nZXJzLCBfbWlkUG9pbnRzLFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbkV2ZW50cy5QaW5jaCA9IFwicGluY2hcIjtcblxuRXZlbnRzLlBpbmNoRW5kID0gXCJwaW5jaGVuZFwiO1xuXG5fZmluZ2VycyA9IFtdO1xuXG5fZGlzdGFuY2VzID0gW107XG5cbl9hbmdsZXMgPSBbXTtcblxuX21pZFBvaW50cyA9IFtdO1xuXG5leHBvcnRzLkxheWVyTXVsdGlUb3VjaEdlc3R1cmUgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoTGF5ZXJNdWx0aVRvdWNoR2VzdHVyZSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gTGF5ZXJNdWx0aVRvdWNoR2VzdHVyZShvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBMYXllck11bHRpVG91Y2hHZXN0dXJlLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgTGF5ZXJNdWx0aVRvdWNoR2VzdHVyZS5kZWZpbmUoXCJwaW5jaFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9waW5jaCAhPSBudWxsID8gdGhpcy5fcGluY2ggOiB0aGlzLl9waW5jaCA9IG5ldyBMYXllclBpbmNoKHRoaXMpO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5waW5jaC5lbmFibGVkID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gTGF5ZXJNdWx0aVRvdWNoR2VzdHVyZTtcblxufSkoRnJhbWVyLkxheWVyKTtcblxud2luZG93LkxheWVyID0gZXhwb3J0cy5MYXllck11bHRpVG91Y2hHZXN0dXJlO1xuXG5MYXllclBpbmNoID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKExheWVyUGluY2gsIHN1cGVyQ2xhc3MpO1xuXG4gIExheWVyUGluY2guZGVmaW5lKFwicHJvcGFnYXRlRXZlbnRzXCIsIExheWVyUGluY2guc2ltcGxlUHJvcGVydHkoXCJwcm9wYWdhdGVFdmVudHNcIiwgdHJ1ZSkpO1xuXG4gIGZ1bmN0aW9uIExheWVyUGluY2gobGF5ZXIxKSB7XG4gICAgdGhpcy5sYXllciA9IGxheWVyMTtcbiAgICB0aGlzLl9lbmRWYWx1ZXMgPSBiaW5kKHRoaXMuX2VuZFZhbHVlcywgdGhpcyk7XG4gICAgdGhpcy5fcGluY2hFbmQgPSBiaW5kKHRoaXMuX3BpbmNoRW5kLCB0aGlzKTtcbiAgICB0aGlzLl9waW5jaCA9IGJpbmQodGhpcy5fcGluY2gsIHRoaXMpO1xuICAgIHRoaXMuX3BpbmNoU3RhcnQgPSBiaW5kKHRoaXMuX3BpbmNoU3RhcnQsIHRoaXMpO1xuICAgIExheWVyUGluY2guX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLmF0dGFjaCgpO1xuICB9XG5cbiAgTGF5ZXJQaW5jaC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubGF5ZXIub24oRXZlbnRzLlRvdWNoU3RhcnQsIHRoaXMuX3BpbmNoU3RhcnQpO1xuICB9O1xuXG4gIExheWVyUGluY2gucHJvdG90eXBlLl9waW5jaFN0YXJ0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLl9maW5nZXJzID0gZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGg7XG4gICAgaWYgKHRoaXMuX2ZpbmdlcnMgPj0gMiAmJiBVdGlscy5pc01vYmlsZSgpKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKEV2ZW50cy5Ub3VjaE1vdmUsIHRoaXMuX3BpbmNoKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKEV2ZW50cy5Ub3VjaEVuZCwgdGhpcy5fcGluY2hFbmQpO1xuICAgIH1cbiAgfTtcblxuICBMYXllclBpbmNoLnByb3RvdHlwZS5fcGluY2ggPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKCF0aGlzLnByb3BhZ2F0ZUV2ZW50cykge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICAgIHRoaXMuX2lzUGluY2hpbmcgPSB0cnVlO1xuICAgIHRoaXMuX2ZpbmdlcnMgPSBldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5fZmluZ2VycyA+PSAyKSB7XG4gICAgICB0aGlzLl9jYWxjdWxhdGVEaXN0YW5jZShldmVudCwgdGhpcyk7XG4gICAgICB0aGlzLl9jYWxjdWxhdGVEaXJlY3Rpb24odGhpcyk7XG4gICAgICB0aGlzLl9jYWxjdWxhdGVBbmdsZShldmVudCwgdGhpcyk7XG4gICAgICB0aGlzLl9jYWxjdWxhdGVNaWRQb2ludChldmVudCwgdGhpcyk7XG4gICAgICByZXR1cm4gdGhpcy5sYXllci5lbWl0KEV2ZW50cy5QaW5jaCwgZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICBMYXllclBpbmNoLnByb3RvdHlwZS5fcGluY2hFbmQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA8PSAwICYmIHRoaXMuX2lzUGluY2hpbmcpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnRzLlRvdWNoTW92ZSwgdGhpcy5fcGluY2gpO1xuICAgICAgdGhpcy5fZW5kVmFsdWVzKHRoaXMpO1xuICAgICAgdGhpcy5sYXllci5lbWl0KEV2ZW50cy5QaW5jaEVuZCwgZXZlbnQpO1xuICAgICAgcmV0dXJuIHRoaXMuX2lzUGluY2hpbmcgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgTGF5ZXJQaW5jaC5wcm90b3R5cGUuX2NhbGN1bGF0ZURpc3RhbmNlID0gZnVuY3Rpb24oZXZlbnQsIGxheWVyKSB7XG4gICAgdmFyIGRpc3RhbmNlLCBsZW5ndGgsIHBvaW50cywgdG91Y2hlcztcbiAgICBsZW5ndGggPSBldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCAtIDE7XG4gICAgdG91Y2hlcyA9IGV2ZW50LnRhcmdldFRvdWNoZXM7XG4gICAgcG9pbnRzID0ge1xuICAgICAgeDogTWF0aC5wb3codG91Y2hlc1tsZW5ndGhdLnBhZ2VYIC0gdG91Y2hlc1swXS5wYWdlWCwgMiksXG4gICAgICB5OiBNYXRoLnBvdyh0b3VjaGVzW2xlbmd0aF0ucGFnZVkgLSB0b3VjaGVzWzBdLnBhZ2VZLCAyKVxuICAgIH07XG4gICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQocG9pbnRzLnggKyBwb2ludHMueSk7XG4gICAgX2Rpc3RhbmNlcy5wdXNoKGRpc3RhbmNlKTtcbiAgICByZXR1cm4gbGF5ZXIuX2Rpc3RhbmNlID0gX2Rpc3RhbmNlcy5zbGljZSgtMSlbMF0gLSBfZGlzdGFuY2VzLnNsaWNlKDAsIDEpWzBdO1xuICB9O1xuXG4gIExheWVyUGluY2gucHJvdG90eXBlLl9jYWxjdWxhdGVEaXJlY3Rpb24gPSBmdW5jdGlvbihsYXllcikge1xuICAgIHZhciBfZGlyZWN0aW9uO1xuICAgIF9kaXJlY3Rpb24gPSBfZGlzdGFuY2VzLnNsaWNlKC0xKVswXSAtIF9kaXN0YW5jZXMuc2xpY2UoLTIsIC0xKVswXTtcbiAgICByZXR1cm4gbGF5ZXIuX2RpcmVjdGlvbiA9IF9kaXJlY3Rpb24gPiAwID8gXCJvdXR3YXJkXCIgOiBcImlud2FyZFwiO1xuICB9O1xuXG4gIExheWVyUGluY2gucHJvdG90eXBlLl9jYWxjdWxhdGVBbmdsZSA9IGZ1bmN0aW9uKGV2ZW50LCBsYXllcikge1xuICAgIHZhciBhbmdsZSwgbGVuZ3RoLCBsaW5lLCB0b3VjaGVzO1xuICAgIGxlbmd0aCA9IGV2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoIC0gMTtcbiAgICB0b3VjaGVzID0gZXZlbnQudGFyZ2V0VG91Y2hlcztcbiAgICBsaW5lID0ge1xuICAgICAgcmlzZTogdG91Y2hlc1swXS5wYWdlWSAtIHRvdWNoZXNbbGVuZ3RoXS5wYWdlWSxcbiAgICAgIHJ1bjogdG91Y2hlc1swXS5wYWdlWCAtIHRvdWNoZXNbbGVuZ3RoXS5wYWdlWFxuICAgIH07XG4gICAgYW5nbGUgPSBNYXRoLmF0YW4obGluZS5yaXNlIC8gbGluZS5ydW4pICogKDE4MCAvIE1hdGguUEkpO1xuICAgIF9hbmdsZXMucHVzaChhbmdsZSk7XG4gICAgcmV0dXJuIGxheWVyLl9hbmdsZSA9IF9hbmdsZXMuc2xpY2UoLTEpWzBdIC0gX2FuZ2xlcy5zbGljZSgwLCAxKVswXTtcbiAgfTtcblxuICBMYXllclBpbmNoLnByb3RvdHlwZS5fY2FsY3VsYXRlTWlkUG9pbnQgPSBmdW5jdGlvbihldmVudCwgbGF5ZXIpIHtcbiAgICB2YXIgaSwgbGVuLCBtaWRQb2ludCwgcmVmLCB0b3VjaCwgeCwgeTtcbiAgICB4ID0gMDtcbiAgICB5ID0gMDtcbiAgICByZWYgPSBldmVudC50YXJnZXRUb3VjaGVzO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdG91Y2ggPSByZWZbaV07XG4gICAgICB4ICs9IHRvdWNoLnBhZ2VYO1xuICAgICAgeSArPSB0b3VjaC5wYWdlWTtcbiAgICB9XG4gICAgbWlkUG9pbnQgPSB7XG4gICAgICB4OiB4IC8gZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGgsXG4gICAgICB5OiB5IC8gZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGhcbiAgICB9O1xuICAgIF9taWRQb2ludHMucHVzaChtaWRQb2ludCk7XG4gICAgbGF5ZXIuX21pZFBvaW50ID0gX21pZFBvaW50cy5zbGljZSgtMSlbMF07XG4gICAgcmV0dXJuIGxheWVyLl9taWRQb2ludERpc3RhbmNlID0gX21pZFBvaW50cy5zbGljZSgtMSlbMF0gLSBfbWlkUG9pbnRzLnNsaWNlKDAsIDEpWzBdO1xuICB9O1xuXG4gIExheWVyUGluY2gucHJvdG90eXBlLl9lbmRWYWx1ZXMgPSBmdW5jdGlvbihsYXllcikge1xuICAgIGxheWVyLl9wcmV2aW91c0Rpc3RhbmNlID0gbGF5ZXIuX2Rpc3RhbmNlID0gX2Rpc3RhbmNlcy5zbGljZSgtMSlbMF0gLSBfZGlzdGFuY2VzLnNsaWNlKDAsIDEpWzBdO1xuICAgIGxheWVyLl9wcmV2aW91c0FuZ2xlID0gbGF5ZXIuX2FuZ2xlID0gX2FuZ2xlcy5zbGljZSgtMSlbMF0gLSBfYW5nbGVzLnNsaWNlKDAsIDEpWzBdO1xuICAgIGxheWVyLl9wcmV2aW91c01pZFBvaW50ID0gbGF5ZXIuX21pZFBvaW50ID0gX21pZFBvaW50cy5zbGljZSgtMSlbMF07XG4gICAgbGF5ZXIuX3ByZXZpb3VzTWlkUG9pbnREaXN0YW5jZSA9IF9taWRQb2ludHMuc2xpY2UoLTEpWzBdIC0gX21pZFBvaW50cy5zbGljZSgwLCAxKVswXTtcbiAgICBfZmluZ2VycyA9IFtdO1xuICAgIF9kaXN0YW5jZXMgPSBbXTtcbiAgICBfYW5nbGVzID0gW107XG4gICAgcmV0dXJuIF9taWRQb2ludHMgPSBbXTtcbiAgfTtcblxuICBMYXllclBpbmNoLmRlZmluZShcImZpbmdlcnNcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmluZ2VycyB8fCAwO1xuICAgIH1cbiAgfSk7XG5cbiAgTGF5ZXJQaW5jaC5kZWZpbmUoXCJkaXN0YW5jZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaXN0YW5jZSB8fCAwO1xuICAgIH1cbiAgfSk7XG5cbiAgTGF5ZXJQaW5jaC5kZWZpbmUoXCJwcmV2aW91c0Rpc3RhbmNlXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ByZXZpb3VzRGlzdGFuY2UgfHwgMDtcbiAgICB9XG4gIH0pO1xuXG4gIExheWVyUGluY2guZGVmaW5lKFwiZGlyZWN0aW9uXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvbiB8fCAwO1xuICAgIH1cbiAgfSk7XG5cbiAgTGF5ZXJQaW5jaC5kZWZpbmUoXCJhbmdsZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hbmdsZSB8fCAwO1xuICAgIH1cbiAgfSk7XG5cbiAgTGF5ZXJQaW5jaC5kZWZpbmUoXCJwcmV2aW91c0FuZ2xlXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ByZXZpb3VzQW5nbGUgfHwgMDtcbiAgICB9XG4gIH0pO1xuXG4gIExheWVyUGluY2guZGVmaW5lKFwibWlkUG9pbnRcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWlkUG9pbnQgfHwgMDtcbiAgICB9XG4gIH0pO1xuXG4gIExheWVyUGluY2guZGVmaW5lKFwicHJldmlvdXNNaWRQb2ludFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wcmV2aW91c01pZFBvaW50IHx8IDA7XG4gICAgfVxuICB9KTtcblxuICBMYXllclBpbmNoLmRlZmluZShcIm1pZFBvaW50RGlzdGFuY2VcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWlkUG9pbnREaXN0YW5jZSB8fCAwO1xuICAgIH1cbiAgfSk7XG5cbiAgTGF5ZXJQaW5jaC5kZWZpbmUoXCJwcmV2aW91c01pZFBvaW50RGlzdGFuY2VcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcHJldmlvdXNNaWRQb2ludERpc3RhbmNlIHx8IDA7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gTGF5ZXJQaW5jaDtcblxufSkoRnJhbWVyLkJhc2VDbGFzcyk7XG4iLCIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIl19
