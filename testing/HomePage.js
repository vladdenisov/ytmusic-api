const { YTMUSIC } = require('../dist/index.js')
const { cookie } = require('../cookie.json')
const main = async () => {
  console.log(YTMUSIC)
  const api = new YTMUSIC(cookie)
  console.log(await api.getHomePage())
}
main()
