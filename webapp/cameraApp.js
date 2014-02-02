var devInfo = [
    {name:"NEX-5R",   url: "http://192.168.122.1:8080/sony"},
    {name:"HDR-AS15", url: "http://10.0.0.1:10000/sony"}
];

var actions = [
    {method:"startRecMode", params:'[]'},
    {method:"setPostviewImageSize", params:'"[2M]"'},
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
 window.addEventListener("load", function()
 {
    console.log("--- Camera Remote API application starts ---");

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
        var select = document.getElementById("actions");
        console.log(select.value);
    });

    document.getElementById("send-json-message").onclick = function(){
        console.log("--- Send Message ---")
        var actionListUrl = document.getElementById("action-list-url").value;
        var action = document.getElementById("actions").value;

        console.log("action list url: " + actionListUrl);
        console.log("action         : " + action);
        console.log(actions[action].method);

        camera.setActionListUrl(actionListUrl);
        camera[actions[action].method](actions[action].params,
            function(id, response){
                console.log("--- success response ---")
                console.log("method: " + actions[action].method);
                console.log("id: " + id);
                console.log(response);
            },
            function(id, error){
                console.log("--- error response ---")
                console.log("id: " + id);
                console.log(error);
            }
        );
    };
});

var LoadImage = function(url)
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var blob = xhr.response;
            var area = document.getElementById("image-area");
            var img = document.createElement("img");
            img.height = 200;
            //img.src = url;
            img.src = window.URL.createObjectURL(blob);
            area.appendChild(img);
        }
    };
    xhr.send();
};

function ab2t(buffer /* ArrayBuffer */)
{
    var arr = new Uint8Array(buffer.length);
    var str = "";
    for(var i = 0, l = arr.length; i < l; i++)
    {
        //str += String.fromCharCode.call(this, arr[i]);
        arr[i] = buffer.charAt(i).charCodeAt();
    }
    console.log(arr[0].toString(16));
    return arr;
}

var flg = 0;
var TestViveview = function()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://192.168.122.1:8080/liveview/liveviewstream", true);
    xhr.onreadystatechange = function()
    {
        if(flg > 5)
        {
            return; 
        }
        flg++;

        console.log("---------------------------------------------------------------");
        console.log("readyState = " + xhr.readyState);
        console.log("status     = " + xhr.status);
        console.log(xhr.getAllResponseHeaders());
        var res = xhr.responseText;
        var len = res.length;
        if(len != 0)
        {
            console.log(ab2t(res));
        }
    }
    /*
    xhr.onprogress = function(evt) {
       console.log("--- onprogress ---"); 
       console.log("lengthComputable: " + evt.lengthComputable); 
       console.log("loaded: " + evt.loaded); 
       console.log("total: " + evt.total); 
    }
    */
    xhr.send();
};
