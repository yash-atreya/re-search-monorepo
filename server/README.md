
# re-search server

This repoository represents the server and core search API for that run google compute engine.

## How it works

This endpoints are deployed on compute engine using ```nodejs``` and ```express```. As this is a ```http``` endpoint it is exposed using ```ngrok``` in the form of a ```https``` URL, prviding a secure connection.

## Local Setup

```sh
npm install

# Replace service accounts
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/firebase/serviceAccount.json"

npm run dev
```
