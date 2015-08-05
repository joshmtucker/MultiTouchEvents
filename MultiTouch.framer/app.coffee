{LayerMultiTouchGestures} = require "MultiTouchEvents"

test = new Layer width: Screen.width/2, height: Screen.width/2
test.center()
test.pinch.enabled = true

test.on Events.Pinch, ->
	# cap the values when they get outside of the range we'll use for scaling
	test.pinch.totalDistance = 100 if test.pinch.totalDistance > 100
	test.pinch.totalDistance = 0 if test.pinch.totalDistance < 0
	# scale by using the total pinched distance so far + new distance
	
	test.scale = Utils.modulate(test.pinch.totalDistance, [0,100],[1,2],true)

