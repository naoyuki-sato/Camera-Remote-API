Camera-Remote-API
=================

Control Sony Device via Camera Remote API

This is Web app sample implementation that controls Sony Device via [Camera Remote API](http://developer.sony.com/develop/cameras/).

for this sample, Web app may not find Device IP address and service end point. IP address and serivce end point are used as the fixed. it will be replaced later w/ SSDP module.

### Hot to run
* please start WiFi on your Sony Deivce and connect your PC.
* start Chrome web browser w/ "disable-web-security". this will allow Web app to use "Cross domain XHR".
> chrome.exe --disable-web-security
* or install this web app as chrome web app
> setting -> tool -> extension function -> enable developer mode and select "webapp" directory by "install unpackaged extension function". 
* Select "Device Name" if you can find your deivce in the list
* if not, please enter your Sony deivce's Service end point url
* select "Action Name" if you can find the action in the list
* if not, please enter your action on JSON message box.
* push "Send Action".
* you will be able to control Sony deivce w/ JSON message.

### To Do List
* add SSDP to find Device
* add more actions.
* have more rich UI

License
----------
Copyright &copy; 2014 Naoyuki Sato(naoyuki.sato@gmail.com)
Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)  