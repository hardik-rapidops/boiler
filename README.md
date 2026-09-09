# Harsco

This is a platform for manages boilers information. It is developed in Node Loopback 3.X fremwork and front end is in angular.js. It have android and ios app also.

## Installation

```
$ git clone https://github.com/softweb/sw-tt-harsco.git
$ npm install

Setup front end

$ cd client/
$ npm install
$ bower install
$ gulp serve

Setup back end

$ Setup mongodb databse in system
$ cd server/
$ npm start

Setup android or ios
$ cordova platforms add android/ios

$ cordova prepare android/ios
```

## Features

* Boilers List
* Boiler Details
* Boiler Add
* Boiler Delete
* Boiler Settings
* Trending
* Sites List
* Site Add
* Notifications
* Users List
* Users Invite
* Users Delete
* User Profile

## Technologies Used

* [**Nodejs**](https://nodejs.org/en/) 
* [**Loopback-3.X**](https://loopback.io/doc/en/lb3/)
* [**Angular.js**](https://angularjs.org/)
* [**Cordova**](https://cordova.apache.org/)
* [**Bower**](https://bower.io/)
* [**Gulp**](https://gulpjs.com/)
* [**Mongodb**](https://www.npmjs.com/package/mongodb)

## Third Party Plugins Used

* [**fcm-node**](https://www.npmjs.com/package/fcm-node) for messages, and parallel calls
* [**hat**](https://www.npmjs.com/package/hat) for generate random IDs and avoid collisions
* [**helmet**](https://www.npmjs.com/package/helmet) for setting various HTTP headers
* [**moment-timezone**](https://www.npmjs.com/package/moment-timezone) for time zone support
* [**multiparty**](https://www.npmjs.com/package/multiparty) for parse http requests with content-type multipart/form-data, also known as file uploads
* [**node-gcm**](https://www.npmjs.com/package/node-gcm) for Firebase Cloud Messaging
* [**node-schedule**](https://www.npmjs.com/package/node-schedule) for cron-like and not-cron-like job scheduler
* [**nodemailer**](https://www.npmjs.com/package/nodemailer) for send e-mails
* [**nodemailer-ses-transport**](https://www.npmjs.com/package/nodemailer-ses-transport) AWS SES module for Nodemailer
* [**http-proxy-middleware**](https://www.npmjs.com/package/http-proxy-middleware) for configure proxy middleware

## Build Details

* **IDE**
  * Please use Visual Studio Code or Sublime text

* **Targets**
  * Boilers
  * Boiler Settings
  * Check Trending
  * Manage Sites

* **Key Branches**
  * **develop** : this contains latest dev code
  * **master** : this contains latest production code for playstore, app store, and live release

* **Live Site**
  * [**Devopement**](https://dev.nuroconnect.com/)
  * [**Production**](https://app.nuroconnect.com/)
  * [**Android**](https://play.google.com/store/apps/details?id=com.vensi.harscopk&hl=en_US&gl=US)
  * [**IOS**](https://apps.apple.com/us/app/nuro-connect/id1193688033?l=es)

* **How to create Android Build**
```bash
Debug Build

$ cordova build android

Release Build

$ cordova build android --release "--" --packageType=apk

go to android sdk folder

$ zipalign -p -f -v 4 C:\Projects\harsco\client\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk C:\Projects\harsco\client\platforms\android\app\build\outputs\apk\release\firstzipalligned.apk

$ apksigner sign --ks C:\Projects\harsco\client\platforms\android\app\build\outputs\apk\release\codesign.jks --in C:\Projects\harsco\client\platforms\android\app\build\outputs\apk\release\firstzipalligned.apk --out C:\Projects\harsco\client\platforms\android\app\build\outputs\apk\release\harsco.apk

key pass : ****
``` 

* **How to create iOS Build**
```bash
  * Go to ios folder (i.e. client/platforms/ios)

  $ xcodebuild -workspace "Nuro Connect.xcworkspace" \
    -scheme "Nuro Connect" \
    -configuration Debug \
    -archivePath build/NuroConnectDev.xcarchive \
    archive

  * Debug Build

  $ xcodebuild \                                                                                                                       
    -exportArchive \
    -archivePath /Users/nik/Documents/GitHub/sw-tt-harsco/client/platforms/ios/build/NuroConnectDev.xcarchive \
    -exportOptionsPlist /Users/nik/Documents/GitHub/sw-tt-harsco/client/platforms/ios/ExportOptionsDebug.plist \
    -exportPath /Users/nik/Documents/GitHub/sw-tt-harsco/client/platforms/ios/build/ipa

  * Release Build

  $ xcodebuild \                                                                                                                       
    -exportArchive \
    -archivePath /Users/nik/Documents/GitHub/sw-tt-harsco/client/platforms/ios/build/NuroConnectDev.xcarchive \
    -exportOptionsPlist /Users/nik/Documents/GitHub/sw-tt-harsco/client/platforms/ios/ExportOptions.plist \
    -exportPath /Users/nik/Documents/GitHub/sw-tt-harsco/client/platforms/ios/build/ipa

  * Download code from https://github.com/softweb/sw-tt-harsco-ios
  * Copy www folder in to the project 
  * Check for certificate and provisoning profile if needs to update please update
  * Change build version and uplaod build
```

## Deployment Steps

* **Step 1**
  * Create build in github (sw-tt-harsco -> Action -> Select Harsco Deployment -> Select branch ->  Click on run workflow)

* **Step 2**
  * After complete build (Step1) you have to copy folder from below path
  * Go to AWS
  * Go to **S3**
  * Go to **harsco-deployment.vensi.com**
  * Select **dev/prd**
  * Copy current date Folder

* **Step 3**
  * Go to **Cloud Formation**
  * Select **dev/prd**
  * Click Update
  * Select **Use current template**
  * Click on **Next** button
  * Add Build Comment in **BuildComment** parameter
  * Replace folder name which you have copy in step 2 in **Version** paramenter
  * Click on **Next** button
  * Click on **Next** button
  * See **Change set preview** if you have changes in any build then show in this module
  * Select **I acknowledge that AWS CloudFormation might create IAM resources.**
  * Clieck on **Update Stack**

* **Step 4**
  * Go to **EC2**
  * Select Server **(cf-dev/cf-prd)** in which you need to update.
  * Go to **Instance state**
  * Select **Reboot instance** (Wait for reboot complete)

* **Step 5**
  * Connect to server
  * After Rebooting completed select server **(cf-dev/cf-prd)** (if you have not selected)
  * Go to **Actions**
  * Select **Connect**
  * Go to **SSH Client**
  * Copy command see in Example
    * For **cf-dev** (instance id: i-02c52947e1c7aa57d) use below command 
      * **ssh -i "harscopk-keypair.pem" ec2-user@ec2-3-80-76-94.compute-1.amazonaws.com**
    * For **cf-prd** (instance id: i-0c73c4f0899490f79)  use below command
      * **ssh -i "harscopk-prod-keypair.pem" ec2-user@ec2-3-81-147-32.compute-1.amazonaws.com**
    * For **cf-prd** (instance id: i-02127f64f8a669f8b) use below command
      * **ssh -i "harscopk-prod-keypair.pem" ec2-user@ec2-3-89-5-104.compute-1.amazonaws.com**
    * For **cf-prd** (instance id: i-053ecf8394b03d2bd) use below command
      * **ssh -i "harscopk-prod-keypair.pem" ec2-user@ec2-54-163-89-172.compute-1.amazonaws.com**
    * **harscopk-keypair.pem** and **harscopk-prod-keypair.pem** is .pem file name
      that you have in your local system.

* **Step 6**
  * Open terminal and go to directory where you put .pem file for connect to server
  * Past command in terminal which you have to copy in step 5

* **Step 7**
  * After successfully connect to server Follow below steps
    * check nginx service status in server for check use below command
      * **sudo systemctl status nginx**
      * If server is successfully rebooted then not active otherwise show active

    * For start nginx service start use bellow command
      * **sudo systemctl start nginx**

* **Step 8**
  * Go to project(harsco) directory in server using **cd harsco/server/** command.
  * Check current node version used in server using **nvm list** command.
  * We need to use **node** version **12.13.1**.
  * For change version on server use **nvm use 12.13.1** command.

* **Step 9**
  * After all above steps completed start server using below command
    * **forever restart server.js** or **forever start server.js**

