const config = require('config')
module.exports = {
    prefix: '/api',
    routes: [
        './controllers/api/tweetController',
        './controllers/api/summaryController',
    ],
    registrations: [
        '@bakjs/mongo'
    ],
    mongo: config.get('mongo')
}
