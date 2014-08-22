var devInfo = [
    {name:"NEX-5R",   url: "http://192.168.122.1:8080/sony"},
    {name:"HDR-AS15", url: "http://10.0.0.1:10000/sony"}
];

var actions = [
    {method:"startRecMode", params:'[]'},
    {method:"setPostviewImageSize", params:'["2M"]'},
    {method:"actTakePicture", params:'[]'},
    {method:"awaitTakePicture", params:'[]'},
    {method:"startLiveview", params:'[]'},
    {method:"stopLiveview", params:'[]'},
    {method:"startMovieRec", params:'[]'},
    {method:"stopMovieRec", params:'[]'}
];

/*
 * This function will be called when this js is loaded.
 */
 window.addEventListener("load", function() {
    console.log("--- Camera Remote API application starts ---");
    console.log("User Agent: " + navigator.userAgent);
    console.log("App Version: " + window.navigator.appVersion.toLowerCase());

    // Init CameraRemoteAPI
    var camera = new CameraRemoteAPI();

    // Init deivce name input
    var device = document.getElementById("device-name");
    device.length = devInfo.length;
    for (var i = 0; i < devInfo.length; i++)
    {
        device.options[i].value = i;
        device.options[i].text = devInfo[i].name;
    }
    device.addEventListener('change', function() {
        console.log("-- Change Device ---");
        var device = document.getElementById("device-name");
        console.log(device.value);
        var i = device.value;

        document.getElementById("action-list-url").value = devInfo[i].url;
    });
    var event = document.createEvent( "MouseEvents" );
    event.initEvent("change", false, true);
    device.dispatchEvent(event);


    // Init action list
    var select = document.getElementById("actions");
    select.length = actions.length;
    for (var i = 0; i < actions.length; i++)
    {
        select.options[i].value = i;
        select.options[i].text = actions[i].method;
    }
    select.addEventListener('change', function() {
        console.log("-- Change Action ---");
        var action = document.getElementById("actions").value;
        console.log(action);

        var params = document.getElementById("action-parames");
        params.value = actions[action].params;
    });
    var event = document.createEvent( "MouseEvents" );
    event.initEvent("change", false, true);
    select.dispatchEvent(event);

    document.getElementById("send-json-message").onclick = function(){
        console.log("--- Send Message ---")
        var actionListUrl = document.getElementById("action-list-url").value;
        var action = document.getElementById("actions").value;

        console.log("action list url: " + actionListUrl);
        console.log("action         : " + action);
        console.log(actions[action].method);

        camera.setActionListUrl(actionListUrl);
        var id = camera[actions[action].method](actions[action].params,
            // success callback
            function(id, response) {
                console.log("--- success response ---")
                console.log("method: " + actions[action].method);
                console.log("id: " + id);
                console.log(response);
                document.getElementById("response-id").value = id;
                document.getElementById("response-parames").value = response;
                // capture still picture
                if(actions[action].method == "actTakePicture") {
                    console.log("--- actTakePicture ---");
                    LoadImage(response);
                } else if(actions[action].method == "startLiveview") {
                    camera.getLiveviewData(response, function(base64Data) {
                        document.getElementById('shoot-image').src = "data:image/jpeg;base64," + base64Data;
                    });
                }
            },
            // error callback
            function(id, error){
                console.log("--- error response ---")
                console.log("id: " + id);
                console.log(error);
            }
        );
        document.getElementById("action-id").value = id;
    };
});

/*
var CRA_LIVEVIEW_MAX_RECEIVE_SIZE = 1000000;
var CRA_LIVEVIEW_COMMON_HEADER_SIZE = 8;
var CRA_LIVEVIEW_PLAYLOAD_HEADER_SIZE = 128;

var GetLiveviewData = function(targetUrl, dataCallback) {
    var offset = 0;
    var headerDecode = false;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', targetUrl, true);
    xhr.overrideMimeType('text\/plain; charset=x-user-defined');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 3) {
            if(xhr.response.length >= CRA_LIVEVIEW_MAX_RECEIVE_SIZE) {
                console.log('finish');
                xhr.abort();
                GetLiveviewData(targetUrl, dataCallback);
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
}
*/


var LoadImage = function(url)
{
    console.log("--- LoadImage ----");
    console.log("url: " + url);

    var userAgent = window.navigator.userAgent.toLowerCase();
    // Android Apk
    if(userAgent.indexOf('android') != -1) {
        var img = document.getElementById("shoot-image");
        img.src = url;
    } else { // Chromw Web app
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var blob = xhr.response;
                var img = document.getElementById("shoot-image");
                img.src = window.URL.createObjectURL(blob);
            }
        };
        xhr.send();
    }
};
