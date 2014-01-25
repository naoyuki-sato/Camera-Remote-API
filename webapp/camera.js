/*
console.debug = function() {};
*/
var ActionListURLs =
[
    {name:"NEX-5R",   url: "http://192.168.122.1:8080/sony/camera"},
    {name:"HDR-AS15", url: "http://10.0.0.1:10000/sony/camera"}
];
var CameraWebAPIs =
[
    {apiService:"/camera", method:"startRecMode", params:''},
    {apiService:"/camera", method:"setPostviewImageSize", params:'"2M"'},
    {apiService:"/camera", method:"actTakePicture", params:''},
    {apiService:"/camera", method:"awaitTakePicture", params:''},
    {apiService:"/camera", method:"startMovieRec", params:''},
    {apiService:"/camera", method:"stopMovieRec", params:''}
];

/*
 * This function will be called when this js is loaded.
 */
 window.addEventListener("load", function()
 {
    console.log("--- Camera Remote API application starts ---");

    var device = document.getElementById("device-name");
    device.length = ActionListURLs.length;
    for (var i = 0; i < ActionListURLs.length; i++)
    {
        device.options[i].value = i;
        device.options[i].text = ActionListURLs[i].name;
    }
    device.addEventListener('change', ChangeDevice);
    ChangeDevice();

    document.getElementById("send-json-message").onclick = SendMessage;

    var select = document.getElementById("actions");
    select.length = CameraWebAPIs.length;
    for (var i = 0; i < CameraWebAPIs.length; i++)
    {
        select.options[i].value = i;
        select.options[i].text = CameraWebAPIs[i].method;
    }
    select.addEventListener('change', ChangeAction);
    ChangeAction();
});

var ChangeDevice = function()
{
    console.log("-- Change Device ---");
    var device = document.getElementById("device-name");
    console.log(device.value);
    var i = device.value;

    document.getElementById("action-list-url").value = ActionListURLs[i].url;
};

var ChangeAction = function()
{
    console.log("-- Change Action ---");
    var select = document.getElementById("actions");
    console.log(select.value);
    var i = select.value;

    var jsonMessage = "{\"method\": \"" + CameraWebAPIs[i].method + "\", \"params\": [" + CameraWebAPIs[i].params + "], \"id\": 1, \"version\": \"1.0\"}";
    document.getElementById("json-message").value = jsonMessage;
    console.log(jsonMessage);
};

var SendMessage = function()
{
    /*
    response = {"result": [["http://ip:port/postview/postview.jpg"]], "id": 1};
    console.log(response.result[0][0]);
    console.log(response.id);

    var url = response.result[0][0];
    if (url.indexOf("postview.jpg", 0) != -1 && url.indexOf("http://", 0) != -1)
    {
        console.log("Bingo");
        var area = document.getElementById("image-area");
        var img = document.createElement("img");
        img.height = 100;
        //img.border = 5;
        img.src = "http://8.media.bustedtees.cvcdn.com/f/-/bustedtees.c34d97af-a400-487c-8a63-008b4ed143b6.jpg";
        area.appendChild(img);
    }
    */
    console.log("--- Send Message ---");

    var message = document.getElementById("json-message").value;
    var target = document.getElementById("action-list-url").value;
    console.log("message: " + message);
    console.log("target:  " + target);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', target, true);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            console.log("Response");
            console.log(xhr.responseText);
            document.getElementById("json-response").innerText = xhr.responseText;

            var response = JSON.parse(xhr.responseText);
            console.log(response.result[0][0]);
            var url = response.result[0][0];
            if (url != undefined && url.indexOf(".JPG", 0) != -1 && url.indexOf("http://", 0) != -1)
            {

                console.log("Bingo");
                LoadImage(url);
                /*
                var area = document.getElementById("image-area");
                var img = document.createElement("img");
                img.height = 100;
                img.src = url;
                area.appendChild(img);
                */
            }
        }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(message);
};

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