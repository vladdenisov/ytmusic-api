const fetch = require('node-fetch')
const helpers = require('../lib/helpers')
const {cookie} = require('../cookie.json')

const getHeaders = cookie => {
  const token = helpers.getAuthToken(cookie)
  console.log(token)
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Authorization': token,
    'Content-Type': 'application/json',
    'X-Goog-AuthUser': '0',
    'x-origin': 'https://music.youtube.com',
    'X-Goog-Visitor-Id': 'CgtvVTcxa1EtbV9hayiMu-P0BQ%3D%3D',
    'Cookie': cookie
  }
}
const sendRequest = (req) => {
  
}
const main = () => {
  const headers = getHeaders('')
  const options = {
    'method': 'POST',
    headers: headers,
    body: helpers.generateBody('VLLM', 'PLAYLIST')
  }
  fetch('https://music.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30', options).then(data => data.json()).then(json => console.log(json))
}
main()

const 