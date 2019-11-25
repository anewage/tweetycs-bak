require('dotenv').config()
const user = process.env.MONGO_USERNAME
const pass = process.env.MONGO_PASSWORD
const hostName = process.env.MONGO_HOSTNAME
module.exports = {
    prefix: '/api',
    routes: [
        './controllers/api/tweetController',
        './controllers/api/summaryController',
    ],
    registrations: [
        '@bakjs/mongo'
    ],
    mongo: {
        connections: {
            default: {
                uri: 'mongodb://' + user + ':' + pass + '@' + hostName + ':27017/admin'
            }
        }
    }
}
