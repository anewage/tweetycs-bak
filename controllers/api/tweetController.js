const { Controller } = require('bak')
const Boom = require('boom')
const { Tweet } = require('../../models')

export default class TweetsController extends Controller {

    /**
     * Includes the routings for this controller
     */
    init () {
        this.post('/tweet/save', this.saveTweet)
        this.get('/aggregate', this.getTweets)
    }

    async saveTweet(request, h) {
        try {
            let tweet = new Tweet(request.payload.tweet);
            await tweet.save()
            console.log('DONE')
            return 'OK'
        } catch (e) {
            Boom.badRequest()
        }
    }

    async getTweets(request, h) {
        try {
            let group_topics = await Tweet.aggregate([
                {
                    '$project': {
                        'labels': 1,
                        'keywords': 1,
                        'topics': {
                            '$objectToArray': '$topics'
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$topics',
                        'includeArrayIndex': 'topic_index'
                    }
                }, {
                    '$unwind': {
                        'path': '$labels',
                        'includeArrayIndex': 'unwinded_label_index',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$group': {
                        '_id': {
                            'bucket': '$labels.id',
                            'group': '$labels.result.group',
                            'topic': '$topics.k'
                        },
                        'count': {
                            '$sum': 1
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$_id.bucket',
                        'details': {
                            '$push': '$$ROOT'
                        }
                    }
                }
            ])
            let theme_topics = await Tweet.aggregate([
                {
                    '$project': {
                        'labels': 1,
                        'keywords': 1,
                        'topics': {
                            '$objectToArray': '$topics'
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$topics',
                        'includeArrayIndex': 'topic_index'
                    }
                }, {
                    '$unwind': {
                        'path': '$labels',
                        'includeArrayIndex': 'unwinded_label_index',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$group': {
                        '_id': {
                            'bucket': '$labels.id',
                            'theme': '$labels.result.theme',
                            'topic': '$topics.k'
                        },
                        'count': {
                            '$sum': 1
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$_id.bucket',
                        'details': {
                            '$push': '$$ROOT'
                        }
                    }
                }
            ])
            return {
                group_topics: group_topics,
                theme_topics: theme_topics
            }
        } catch (e) {
            Boom.badRequest()
        }
    }
}
