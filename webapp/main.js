chrome.app.runtime.onLaunched.addListener(function()
{
	/*
	 * Create Web app windows w 680 x 480
	 */
	chrome.app.window.create('cameraApp.html', {
		width: 680,
		height: 480
	});
});
