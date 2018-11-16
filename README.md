# What’s Your Impression

_Recomendation: To parse the query string we recomend [qs.js](https://github.com/ljharb/qs) (A querystring parser with nesting support)_

### Boilerplate code example of a complete app that can communicate with Upshow.

__General description__: This is a simple code example of a kind of survey app that will ask the user (client in venue) to rate the service. 

## The App

![App](https://s3.amazonaws.com/static.upshow.tv/upshow-apps/image2.png)

__Description__: It's a black background page with white text that shows the venue's logo and a question. Also it gives a code and an url where the venue's client can go to answer the question.


When the app is called from Upshow, Upshow will pass multiple parameters in the query string:

* __app_url__
    * _URL that has to be shown on the screen if the app has a mobile part_
* __device_code__
    * _Code that has to be shown on the screen if the app has a mobile part. It is requested by the mobile app on __app_url___
* __app_key__
    * _Identify the instance of the app that is running_
* __device_id__
    * _Identify the device where is running this app instance_

* \*


This app will be loaded in an iframe and It uses the IframeBridge from [wisper-rpc](https://github.com/wisper-rpc/wisper-js) to comunicate with The Upshow App that wrap that iframe 

#### IframeBridge Initialization

```
import {IframeBridge} from 'wisper-rpc';

const iframeBridge = new IframeBridge(window.parent);

```

#### Expose Functions to the The Upshow App

This app must register a function that iframeBridge will expose as "play", when this function is invoked from The Upshow App, the app starts to be displayed on the screen by The Upshow App.

```
iframeBridge.exposeFunction('play', startRunning);

function startRunning() {
    // Do your thing app to start running.
    return true;
}
```

#### Invoke Functions

The Upshow App exposes 3 function trough the Wisper-RCP that this App can invoke any time after IframeBridge was initialized.

* __onReady__ _Invoked after the app is ready to run_

```
        iframeBridge.invoke('onReady')
            .then(result => {
                console.log(`resolve onReady - `, result);
            })
            .catch(error => {
                console.error(`reject onReady - `, error);
            });
```
 * __onDone__ _When it's invoked tells Upshow that the app has ended_

```
        iframeBridge.invoke('onDone')
            .then(result => {
                console.log(`resolve onDone - `, result);
            })
            .catch(error => {
                console.error(`reject onDone - `, error);
            });
```
* __onError__ _When it's invoked tells Upshow that the app has throw an error_

```
        iframeBridge.invoke('onError', [error])
            .then(() => {
                console.log(`resolve onError`);
            })
            .catch(error => {
                console.error(`reject onError - `, error);
            });
```

## Mobile Web App (Optional)

![Mobile](http://s3.amazonaws.com/static.upshow.tv/upshow-apps/image3.png)

__Description__: Where the venue's client goes to answer the question. 

This part is needed when there is interaction between the venue's client and the app on screen. 

When the mobile web app is called from Upshow, Upshow will pass multiple parameters in the query string:

* __app_key__
    * _Identify the instance of the app that is running_
* __deviceId__
    * _Identify the device where is running this app instance_

## Node.js App - Admin Web Page And API (Optional)

__Description__: A simple node.js app that mange the app settings based on the __app_key__ that are setup from the admin page, and storage the result of the surveys that the mobile app

### Tha Admin Web Page is called from Upshow's Contro Panel when the app instance is setup by the customer.

![Admin](http://s3.amazonaws.com/static.upshow.tv/upshow-apps/image1.png)

When the admin web page is called from Upshow's Contro Panel, Upshow will pass multiple parameters in the query string:

* __app_key__
    * _Identify the instance of the app that is running_
* \*
