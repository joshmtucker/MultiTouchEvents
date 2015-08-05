Events.Pinch = "pinch"
Events.PinchEnd = "pinchend"

_fingers = []
_distances = []
_angles = []
_midPoints = []

class exports.LayerMultiTouchGesture extends Framer.Layer
	constructor: (options={}) ->
		super options

	@define "pinch",
		get: -> @_pinch ?= new LayerPinch(@)
		set: -> @pinch.enabled = value if _isBoolean(value)

# Replace Layer with LayerMultiTouchGesture
window.Layer = exports.LayerMultiTouchGesture

class LayerPinch extends Framer.BaseClass
	@define "propagateEvents", @simpleProperty("propagateEvents", true)
	

	constructor: (@layer) ->
		super

		@enabled = true

		@attach()

	attach: ->
		@layer.on Events.TouchStart, @_pinchStart

	remove: ->
		@layer.off Events.TouchStart, @_pinchStart

	_pinchStart: (event) =>
		if Utils.isMobile()
			@_fingers = event.targetTouches.length

			if @_fingers >= 2
				document.addEventListener(Events.TouchMove, @_pinch)
				document.addEventListener(Events.TouchEnd, @_pinchEnd)

	_pinch: (event) =>
		return unless @enabled

		event.preventDefault()
		event.stopPropagation() unless @propagateEvents

		@_isPinching = true

		@_fingers = event.targetTouches.length

		if @_fingers >= 2

			# Distance
			@_calculateDistance(event)

			# Direction
			@_calculateDirection(event)

			# Angle
			@_calculateAngle(event)

			# Midpoint
			@_calculateMidPoint(event)

			@layer.emit(Events.Pinch, event)

	_pinchEnd: (event) =>
		if event.targetTouches.length <= 0 and @_isPinching

			event.stopPropagation() unless @propagateEvents

			document.removeEventListener(Events.TouchMove, @_pinch)

			@_endValues()

			@layer.emit(Events.PinchEnd, event)

			@_isPinching = false

	_calculateDistance: (event) ->
		length = event.targetTouches.length - 1
		touches = event.targetTouches

		points = 
			x: Math.pow(touches[length].pageX - touches[0].pageX, 2)
			y: Math.pow(touches[length].pageY - touches[0].pageY, 2)

		distance = Math.sqrt(points.x + points.y)
		_distances.push(distance)
		@_distance = _distances[-1..-1][0] - _distances[0..0][0]

	_calculateDirection: ->
		_direction = _distances[-1..-1][0] - _distances[-2..-2][0]

		@_direction = if _direction > 0 then "outward" else "inward"


	_calculateAngle: (event) ->
		length = event.targetTouches.length - 1
		touches = event.targetTouches

		line = 
			rise: touches[0].pageY - touches[length].pageY
			run: touches[0].pageX - touches[length].pageX

		angle = Math.atan(line.rise/line.run) * (180/Math.PI)
		_angles.push(angle)
		@_angle = _angles[-1..-1][0] - _angles[0..0][0]

	_calculateMidPoint: (event) ->
		x = 0
		y = 0
		
		for touch in event.targetTouches
			x += touch.pageX
			y += touch.pageY

		midPoint = 
			x: x/event.targetTouches.length
			y: y/event.targetTouches.length

		_midPoints.push(midPoint)
		@_midPoint = _midPoints[-1..-1][0]
		@_midPointDistance = _midPoints[-1..-1][0] - _midPoints[0..0][0]


	_endValues:  ->
		@_previousDistance = @_distance = _distances[-1..-1][0] - _distances[0..0][0]
		@_previousAngle = @_angle = _angles[-1..-1][0] - _angles[0..0][0]
		@_previousMidPoint = @_midPoint = _midPoints[-1..-1][0]
		@_previousMidPointDistance = _midPoints[-1..-1][0] - _midPoints[0..0][0]
		@_totalDistance = @totalDistance + @distance

		# TODO: Is it necessary to clear these? Would there be a reason to keep their values?
		# Wouldn't require storing previous values for modulate, but may run into other problems

		_fingers = []
		_distances = []
		_angles = []
		_midPoints = []

	@define "fingers", get: -> @_fingers or 0

	@define "distance", get: -> @_distance or 0
	@define "totalDistance", 
		get: -> @_totalDistance or 0
		set: (value) -> @_totalDistance = value

	@define "direction", get: -> @_direction or 0


	@define "angle", get: -> @_angle or 0
	@define "previousAngle", get: -> @_previousAngle or 0

	@define "midPoint", get: -> @_midPoint or 0
	@define "previousMidPoint", get: -> @_previousMidPoint or 0
	@define "midPointDistance", get: -> @_midPointDistance or 0
	@define "previousMidPointDistance", get: -> @_previousMidPointDistance or 0


