{LayerMultiTouchGestures} = require "MultiTouchEvents"

test = new Layer width: Screen.width - 200, height: Screen.height - 200
test.center()
test.pinch.enabled = true

test.on Events.Pinch, ->
	test.scale = Utils.modulate(test.pinch.distance, [0, 400], [.5, 2], true)
	
test.on Events.PinchEnd, ->
	
	test.animate
		properties:
			rotation: 0
			scale: 1	