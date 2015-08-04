{LayerMultiTouchGestures} = require "MultiTouchEvents"

test = new Layer width: Screen.width - 200, height: Screen.height - 200
test.center()
test.pinch.enabled = true

test.on Events.Pinch, ->
	# Need to figure out this piece so scaling, in this example, is fluid (no noticeable jumps, jitteriness)
	test.scale = Utils.modulate(test.pinch.distance + test.pinch.previousDistance, [-150, 800+test.pinch.previousDistance], [.5, 2], true)