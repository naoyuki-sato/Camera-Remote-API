function CameraRemoteAPI(actionListUrl) {
	this.methods = [
		"getShootMode",
		"getSupportedShootMode",
		"getAvailableShootMode",
		"actTakePicture",
		"awaitTakePicture",
		"startMovieRec",
		"stopMovieRec",
		"startAudioRec",
		"stopAudioRec",
		"startLiveview",
		"startLiveviewWithSize",
		"stopLiveview",
		"actZoom",
		"setSelfTimer",
		"getSelfTimer",
		"getSupportedSelfTimer",
		"getAvailableSelfTimer",
		"setPostviewImageSize",
		"getPostviewImageSize",
		"getSupportedPostviewImageSize",
		"getAvailablePostviewImageSize",
		"getEvent", "startRecMode",
		"stopRecMode",
		"getAvailableApiList",
		"getApplicationInfo",
		"getVersions",
		"getMethodTypes"
	];
	this.service = "/camera";
	this.version = "\"1.0\"";

	this.actionListUrl = actionListUrl;

	for(var i = 0; i < this.methods.length; i++) {
		this[this.methods[i]] = (function(j) {
			return function (params, successCallback, errorCallback) {
				this.num = j;
				this.endPointUrl = this.actionListUrl + this.service;

				//var id = Math.round(new Date().getTime());
				var id = 1;

				var message = "{ \"method\": " + "\"" + this.methods[this.num] + "\", \"params\": " + params + "," + "\"id\": " + id + ", \"version\": " + this.version + "}";
				console.log(message);
				console.log(this.endPointUrl);

				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4 && xhr.status === 200) {
						console.log(xhr.responseText);
						var response = JSON.parse(xhr.responseText);
						successCallback(response.id, response.result);
					}
				};
				xhr.open('POST', this.endPointUrl, true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(message);

				return id;
			};
		})(i);
	}
};

CameraRemoteAPI.prototype.setActionListUrl = function(actionListUrl)
{
	this.actionListUrl = actionListUrl;
};