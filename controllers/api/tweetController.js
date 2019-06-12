const { Controller } = require('bak')
const Boom = require('boom')
const { Tweet } = require('../../models')

export default class TweetsController extends Controller {

    /**
     * Includes the routings for this controller
     */
    init () {
        this.post('/tweet/save', this.saveTweet)
        this.get('/tweets', this.getTweets)
    }

    async saveTweet(request, h) {
        try {
            let tweet = new Tweet(request.payload.tweet);
            await tweet.save()
            return 'OK'
        } catch (e) {
            Boom.badRequest()
        }
    }

    getTweets(request, h) {
        try {
            let sankeyData = Tweet.aggregate({$group: {_id: '$cause_factors', }})
                .select('_id id id_str text source user retweet_count favorite_count entities created_at')
        } catch (e) {
            Boom.badRequest()
        }
    }
}
