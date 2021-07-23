# logreps-mobileclient

DEPLOYMENT
- Update config.xml with proper version
- Update config.ts with api endpoint and version

# Troubleshooting
rm -rf plugins/
rm -rf platforms/

When installing a new cordova module, best to remove platforms, and then install individual ionic cordova plugins

# Plugins:
ionic deploy add  \
    --app-id="TBDTBD" \
    --channel-name="staging" \
    --update-method="background"

- Dynamic Links
ionic cordova plugin add cordova-plugin-firebase-dynamiclinks --variable PAGE_LINK_DOMAIN="careerplace.page.link"
npm install @ionic-native/firebase-dynamic-links
copy google-services.json to ./platforms/android/app/



- Social Share
cordova plugin add cordova-plugin-androidx
cordova plugin add cordova-plugin-androidx-adapter

ionic cordova plugin add cordova-plugin-x-socialsharing
npm install @ionic-native/social-sharing

!!!!Upload with warnings after this step !!!

- FCM
ionic cordova plugin add cordova-plugin-fcm-with-dependecy-updated
npm install @ionic-native/fcm

Associated Domains
applinks:logreps.page.link

