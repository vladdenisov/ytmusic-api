# Unofficial YouTube Music API 
![GitHub last commit](https://img.shields.io/github/last-commit/vladdenisov/ytmusic-api) ![GitHub](https://img.shields.io/github/license/vladdenisov/ytmusic-api) ![npm bundle size](https://img.shields.io/bundlephobia/min/ytmusic) ![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/vladdenisov/ytmusic-api)

Simple API Project for NodeJS written in TypeScript inspired by [sigma67's python library](https://github.com/sigma67/ytmusicapi)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development.

### Prerequisites

1. NodeJS 10+
2. NPM
3. Google Account

### Installing
#### Using npm 
[![NPM](https://nodei.co/npm/ytmusic.png?compact=true)](https://nodei.co/npm/ytmusic/)

#### Building it yourself
Clone github repo
```sh 
  $ git clone https://github.com/vladdenisov/ytmusic-api 
```
Install dependencies
```sh
  $ npm i
```
Build it
```sh
  $ npm run build
```
You will see `dist` folder, where all built files are stored.

### Usage

#### Getting the cookie
Get the auth cookie from requests to YTMusic in your browser: 

 - Open [YouTube Music](https://music.youtube.com/) in browser
 - Go to the developer tools (Ctrl-Shift-I) and find an authenticated POST request. You can filter for /browse to easily find a suitable request.
 - Copy `cookie` from `Request Headers`
 
#### Using in code
Import lib to your code:
```js
  const { YTMUSIC } = require('ytmusic')
  // or if you build it yourself
  const { YTMUSIC } = require('path/to/ytmusic/dist/index.js')
```
Create new Instance of api with your cookie: 
```js
  const api = new YTMUSIC("cookie")

  // or if you want it to use not default account, specify userID (refer to docs to get it): 
  const api = new YTMUSIC("cookie", "userID")
```
Use it: 
```js
  const data = await api.getPlaylist('RDCLAK5uy_k1Wu8QbZASiGVqr1wmie9NIYo38aBqscQ')
  console.log(data.title)
  // { text: '80s Pop-Rock Anthems' }
```
## Built With

* [TypeScript](https://www.typescriptlang.org/) - JavaScript that scales.
* [node-fetch](https://www.npmjs.com/package/node-fetch) - A light-weight module that brings window.fetch to Node.js

## Contributing

~~Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to us.~~

Just contribute <3

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Vlad Denisov** - *Initial work* - [vladdenisov](https://github.com/vladdenisov)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
