oauth-firebase-proxy
------------------

This project serves the purpose that the firebase google authentication provider doesn't provide stuff like email-adress etc. which restricts the possibilities to formulate security-rules.

https://www.firebase.com/docs/security/api/rule/auth.html

https://developers.google.com/identity/sign-in/web/reference


Workflow:
1. Wepapp logs in at google: https://developers.google.com/identity/sign-in/web/build-button
2. Webapp sends the token from the authentication-response (success.getAuthResponse().access_token) to the auth-proxy https://developers.google.com/identity/sign-in/web/reference
3. The auth-proxy validates the token against https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=accessToken to ensure ist validity. It is important to check the audience against the own clientid (https://developers.google.com/identity/protocols/OAuth2UserAgent) additional it checks the email-adress
4. The auth-proxy creates a firebase-token using this method https://www.firebase.com/docs/web/guide/login/custom.html and sends it to the webapp
5. the webapp validates itself against firebase with the jwt-token

Alternative to 2. and 3.: https://developers.google.com/identity/sign-in/web/backend-auth
