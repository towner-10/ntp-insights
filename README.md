<img width="800" src="./assets/images/NTP_Insights_GIF.gif">

## 🌪 A Rundown on NTP Insights

**NTP Insights** is a web application platform developed by Western Engineering research interns to support the <a href="https://www.uwo.ca/ntp/">Northern Tornadoes Project</a>'s capacity in collecting, analyzing, and sharing important research data in a meaningful way.

> ```01``` **Sign-in Process**

Users can create an NTP Insights account using one of two methods: by entering their email address or by linking their Discord account. If using an email address, a verification email will be sent with a link to proceed. If using a Discord account, a pop-up will prompt the user to authorize the account.

<img width="400" src="./assets/images/Signin.png">

> ```02``` **Account Customization**

Upon initial account creation, the user will be prompted to set their profile settings, including their name and profile picture (optional). Profile settings can be accessed at any time through the main dropdown in the top right corner of the screen.

> ```03``` **Authentication**

For full access to the NTP Insights feature set, a user must be ```NTP Authenticated```. Any currently authenticated user can authenticate other users by navigating to ```Settings > ...```.

> ```04``` **Main Dashboard and Navigation**

The main dashboard provides quick access to the three NTP Insights software tools. The navigation bar at the top persists on every NTP Insights page and includes a main dropdown with access to all NTP Insights pages and a button to configure the website theme.

## NTP Social

> ```01``` Social Dashboard

## NTP 360

NTP 360 enables the uploading, viewing, and sharing of 360-degree panorama captures taken on severe storm damage surveys on-screen and in virtual reality (VR) using  ```React Three XR``` (based on ```WebXR```). Users can move through and around the street-level imagery and toggle between ```Before``` and ```After``` to compare changes that occurred from the storm.

> ```01``` 360 Dashboard

The 360 dashboard allows users to create a new event path upload and access the table of pre-existing uploads.

> ```02``` Uploading New Event Paths

After providing event details such as the event name, folder name, and date, the upload process is broken into 3 distinct uploads: the ```framepos.txt``` file, the event panoramas, and the comparison panoramas.

***Uploading the framepos file.*** NTP 360 is designed around the ```NCTech iSTAR Pulsar``` camera workflow. Once data formation through ```NCTech Immersive Studio``` is complete, a ```framepos``` text file is created, storing all of the necessary geospatial data for each photo. NTP 360 parses this data and uses it to plot map points, populate a ```Details``` pane alongside the 360 view, and more.

***Uploading the event panoramas.*** After counting the number of data entries in the ```framepos.txt``` file, NTP 360 determines the number of panoramas that it expects to be uploaded. Note that only numerically chronological file names, i.e., ```0000000000```, ```0000000001```, ```0000000002```, etc. are accepted.

***Uploading the comparison panoramas.*** NTP 360 references the latitude and longitude values for each panorama and uses the ```Google Street View API``` to fetch the closest available panorama for each of the uploaded ```iSTAR Pulsar``` panoramas. A copyable/downloadable list of panorama IDs is then given to be entered into ```Street View Download 360``` for exporting. Note that each comparison panorama file must be named after its panorama ID.

> ```03``` Viewing Event Path Uploads (Screen and VR)

NTP 360 uses ```Three.js``` to create a spherical texture map view of each panorama and ```CameraControls``` to look around the view. The following are the controls for the 360 view:

<img width="800" src="./assets/images/NTP_360_controls.png">

Alongside the 360 view is a ```Details``` pane that offers useful information about the panorama and more granular sequence controls. There is also an interactive map powered by the ```Mapbox API``` that plots a clickable point for every 5 images along the event route.

> ```04``` Sharing Event Path Uploads

From the 360 dashboard, users can copy a shareable public link that leads directly to its associated event path upload. An inline frame of the 360 view can also easily be embedded onto other webpages.

##  NTP LiDAR

NTP LiDAR

> ```01``` LiDAR Dashboard

The LiDAR dashboard allows users to create a new scan upload and access the table of pre-existing uploads.

> ```02``` Uploading New Scans

> ```03``` Viewing Scan Uploads

> ```04``` Sharing Scan Uploads
