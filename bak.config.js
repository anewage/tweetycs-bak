const config = require('config')
module.exports = {
    prefix: '/api',
    routes: [
        './controllers/api/tweetController',
    ],
    registrations: [
        '@bakjs/mongo'
    ],
    mongo: config.get('mongo')
}
