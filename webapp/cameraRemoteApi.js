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

CameraRemoteAPI.prototype.setActionListUrl = function(actionListUrl) {
	this.actionListUrl = actionListUrl;
};

var CRA_LIVEVIEW_MAX_RECEIVE_SIZE = 500000;
var CRA_LIVEVIEW_COMMON_HEADER_SIZE = 8;
var CRA_LIVEVIEW_PLAYLOAD_HEADER_SIZE = 128;

CameraRemoteAPI.prototype.getLiveviewData = function(targetUrl, dataCallback) {
    var headerDecode = false;
    var offset = 0;
    var self = arguments.callee;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', targetUrl, true);
    xhr.overrideMimeType('text\/plain; charset=x-user-defined');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 3) {
            if(xhr.response.length >= CRA_LIVEVIEW_MAX_RECEIVE_SIZE) {
                console.log('finish');
                xhr.abort();
                //this[getLiveviewData](targetUrl, dataCallback);
                self(targetUrl, dataCallback);
            }

            if(xhr.response.length >= (CRA_LIVEVIEW_COMMON_HEADER_SIZE + CRA_LIVEVIEW_PLAYLOAD_HEADER_SIZE+offset)) {
                if(headerDecode == false) {
                    var startByte = (xhr.responseText.charCodeAt(offset + 0) & 0xff);
                    var playLoadType = xhr.responseText.charCodeAt(offset + 1) & 0xff;
                    var sequenceNumber  = (xhr.responseText.charCodeAt(offset + 2) & 0xff) << 8;
                        sequenceNumber += (xhr.responseText.charCodeAt(offset + 3) & 0xff);
                    var timeStamp  = (xhr.responseText.charCodeAt(offset + 4) & 0xff) << 24;
                        timeStamp += (xhr.responseText.charCodeAt(offset + 5) & 0xff) << 16;
                        timeStamp += (xhr.responseText.charCodeAt(offset + 6) & 0xff) <<  8;
                        timeStamp += (xhr.responseText.charCodeAt(offset + 7) & 0xff);
                    var startCode = [(xhr.responseText.charCodeAt(offset + 8) & 0xff), (xhr.responseText.charCodeAt(offset + 9) & 0xff), (xhr.responseText.charCodeAt(offset + 10) & 0xff), (xhr.responseText.charCodeAt(offset + 11) & 0xff)];
                    var jpegSize  = ((xhr.responseText.charCodeAt(offset + 12) & 0xff) * (256 * 256));
                        jpegSize += ((xhr.responseText.charCodeAt(offset + 13) & 0xff) * 256);
                        jpegSize += ((xhr.responseText.charCodeAt(offset + 14) & 0xff));
                    var paddingSize = xhr.responseText.charCodeAt(offset + 15) & 0xff;

                    console.log('startByte: ' +  (startByte).toString(16));

                    console.log('playLoadType: ' +  (playLoadType).toString(16));
                    console.log('startCode: ' +  (startCode[0]).toString(16) + (startCode[1]).toString(16) + (startCode[2]).toString(16) + (startCode[3]).toString(16));

                    console.log('jpegSize: ' +  (jpegSize).toString(16));
                    console.log('paddingSize: ' +  (paddingSize).toString(16));
                }

                if(xhr.response.length >= (CRA_LIVEVIEW_COMMON_HEADER_SIZE + CRA_LIVEVIEW_PLAYLOAD_HEADER_SIZE + jpegSize + offset)) {
                    binary = '';
                    for (var i = (CRA_LIVEVIEW_COMMON_HEADER_SIZE + CRA_LIVEVIEW_PLAYLOAD_HEADER_SIZE + offset), len = (CRA_LIVEVIEW_COMMON_HEADER_SIZE + CRA_LIVEVIEW_PLAYLOAD_HEADER_SIZE + offset)+jpegSize; i < len; ++i) {
                        binary += String.fromCharCode(xhr.responseText.charCodeAt(i) & 0xff);
                    }

                    var base64 = window.btoa(binary);
                    if (base64.length > 0 && base64[0] == "/") {
                        //document.getElementById('shoot-image').src = "data:image/jpeg;base64," + base64;
                        dataCallback(base64);
                        offset = CRA_LIVEVIEW_COMMON_HEADER_SIZE + CRA_LIVEVIEW_PLAYLOAD_HEADER_SIZE + offset + jpegSize + paddingSize;
                        headerDecode = false;
                        return;
                    } else {
                        console.log('What is this?');
                        xhr.abort();
                        return;
                    }
                }
                return;
            }
        }
    };
    xhr.send();
};

