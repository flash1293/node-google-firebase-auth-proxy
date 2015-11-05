# google-firebase-auth-proxy

This project serves the purpose that the firebase google authentication provider doesn't provide stuff like email-adress etc. which restricts the possibilities to formulate security-rules.

For this to work you have to enable "custom" login in firebase.

https://www.firebase.com/docs/security/api/rule/auth.html

https://developers.google.com/identity/sign-in/web/reference


## Workflow
* Wepapp logs in at google: https://developers.google.com/identity/sign-in/web/build-button
* Webapp sends the token from the authentication-response (success.getAuthResponse().access_token) to the auth-proxy https://developers.google.com/identity/sign-in/web/reference
* The auth-proxy validates the token against the google service to ensure ist validity. It is important to check the audience against the own clientid (https://developers.google.com/identity/protocols/OAuth2UserAgent). additional it checks the hd-field (domain of the registered user) https://developers.google.com/identity/sign-in/web/backend-auth
* The auth-proxy creates a firebase-token using this method https://www.firebase.com/docs/web/guide/login/custom.html and sends it to the webapp
* the webapp validates itself against firebase with the jwt-token

## Usage

The google-firebase-auth-proxy-module provides a single function which takes a config-object as first parameter and returns an express app-instance:
```js
var config = {
  client_id: 'xxxxxxxxxxxxxxxx.apps.googleusercontent.com', //client-id of the webapp-project
  hd: 'test.de', //optional, validates whether the logged in user has a special domain
  firebase_secrect: 'abc123' //firebase-secret, needed to generate the token for the webapp
};
var authProxy = require('google-firebase-auth-proxy')(config);

//start server
authProxy.listen(8080); //the auth-proxy is now running on port 8080
```

The client-side usage is documented in test/index.html. You have to perform an ordinary google-login using the google signin-api:
```html
<div id="my-signin2"></div>
<script>
  function renderButton() {
    gapi.signin2.render('my-signin2', {
      'scope': 'https://www.googleapis.com/auth/plus.login',
      'width': 200,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
      'onsuccess': onSuccess,
      'onfailure': onFailure
    });
  }
</script>
<script src="https://apis.google.com/js/platform.js?onload=renderButton" async defer></script>
```

In the `onSuccess` callback you have to obtain the id-token and send it to the auth-proxy via AJAX. The server has CORS activated, it doesn't matter where it's hosted. The auth-proxy checks whether the token is valid and is issued for the correct app and hd. If this is true, it creates a new firebase-token and returns it to the client. The format of the answer is the following json-object: 
```js
{
  valid: true,
  token: 'issuedfirebasetoken'
}
```

```js
function onSuccess(googleUser) {
  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
  $.ajax('http://localhost:8081', {
    method: 'GET',
    data: {
      id_token: googleUser.getAuthResponse().id_token
    },
    success: function(data) {
      console.log(data);
      if(data.valid) {
        //TODO login to firebase using data.token
      } else {
        //TODO error-handling
      }
    }
  });
}
```

You can now use `data.token` to validate against the firebase-service. The token contains the following values (you can use them in the `auth`-object in firebase rules, see https://www.firebase.com/docs/security/api/rule/auth.html):
```js
{
  uid: 'google-id of the user',
  email: 'email-adress of the user',
  given_name: 'firstname of the user',
  family_name: 'lastname of the user'
}
```