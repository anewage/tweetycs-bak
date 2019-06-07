const { Controller } = require('bak')
const Boom = require('boom')
const { Tweet } = require('../../models')

export default class TweetsController extends Controller {

    /**
     * Includes the routings for this controller
     */
    init () {
        this.post('/tweet/save', this.saveTweet)
    }

    async saveTweet (request, h) {
        try {
            var tweet = new Tweet(request.payload.tweet)
            await tweet.save()
            return 'OK'
        } catch (e) {
            Boom.badRequest()
        }
    }
}
