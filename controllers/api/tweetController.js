const { Controller } = require('bak')
const Boom = require('boom')
const { Tweet } = require('../../models')

export default class TweetsController extends Controller {

    /**
     * Includes the routings for this controller
     */
    init () {
        this.post('/tweet/save', this.saveTweet)
        this.get('/aggregate/users', this.getAggregateUsers)
        this.get('/aggregate/topics', this.getAggregateTopics)
        this.get('/aggregate/keywords', this.getAggregateKeywords)
    }

    async saveTweet(request, h) {
        try {
            let tweet = new Tweet(request.payload.tweet);
            tweet['arrived_at'] = new Date().getUTCMilliseconds()
            await tweet.save()
            return 'OK'
        } catch (e) {
            Boom.badRequest()
        }
    }

    async getAggregateUsers(request, h) {
        try {
            let user_groups = await Tweet.aggregate([
                {
                    '$sort': {
                        'arrived_at': 1
                    }
                }, {
                    '$limit': 100
                }, {
                    '$unwind': {
                        'path': '$analysis',
                        'includeArrayIndex': 'unwinded_analysis_index',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$group': {
                        '_id': {
                            'bucket': '$analysis.id',
                            'user': '$user.screen_name'
                        },
                        'analysis': {
                            '$first': '$analysis'
                        },
                        'avg_sentiment': {
                            '$avg': '$analysis.result'
                        },
                        'user': {
                            '$first': '$user'
                        },
                        'tweets': {
                            '$push': {
                                'id': '$id',
                                'created_at': '$created_at',
                                'text': '$text',
                                'retweet_count': '$retweet_count',
                                'favorite_count': '$favorite_count',
                                'possibly_sensitive': '$possibly_sensitive',
                                'analysis': '$analysis'
                            }
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$_id.bucket',
                        'items': {
                            '$push': '$$ROOT'
                        }
                    }
                }
            ]).allowDiskUse(true)
            return {user_groups: user_groups}
        } catch (e) {
            Boom.badRequest()
        }
    }

    async getAggregateTopics(request, h) {
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
                        },
                        'labels': {
                            '$first': '$labels'
                        },
                    }
                }, {
                    '$group': {
                        '_id': '$_id.bucket',
                        'items': {
                            '$push': '$$ROOT'
                        }
                    }
                }
            ]).allowDiskUse(true)
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
                        },
                        'labels': {
                            '$first': '$labels'
                        },
                    }
                }, {
                    '$group': {
                        '_id': '$_id.bucket',
                        'items': {
                            '$push': '$$ROOT'
                        }
                    }
                }
            ]).allowDiskUse(true)
            return {
                group_topics: group_topics,
                theme_topics: theme_topics
            }
        } catch (e) {
            Boom.badRequest()
        }
    }

    async getAggregateKeywords(request, h) {
        try {
            const themes = await Tweet.aggregate([
                {
                    '$unwind': {
                        'path': '$labels',
                        'includeArrayIndex': 'label_index_unwinded',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$unwind': {
                        'path': '$analysis',
                        'includeArrayIndex': 'analysis_index_unwinded',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$project': {
                        'topics': {
                            '$objectToArray': '$topics'
                        },
                        'analysis': 1,
                        'labels': 1
                    }
                }, {
                    '$unwind': {
                        'path': '$topics',
                        'includeArrayIndex': 'topics_index_unwinded',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$group': {
                        '_id': {
                            'topic': '$topics.k',
                            'keywords': '$topics.v',
                            'theme': '$labels.result.theme',
                            'analysis': '$analysis.id',
                            'labeling': '$labels.id',
                        },
                        'avgSentiment': {
                            '$avg': '$analysis.result'
                        }
                    }
                }
            ]).allowDiskUse(true)
            const groups = await Tweet.aggregate([
                {
                    '$unwind': {
                        'path': '$labels',
                        'includeArrayIndex': 'label_index_unwinded',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$unwind': {
                        'path': '$analysis',
                        'includeArrayIndex': 'analysis_index_unwinded',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$project': {
                        'topics': {
                            '$objectToArray': '$topics'
                        },
                        'analysis': 1,
                        'labels': 1,
                    }
                }, {
                    '$unwind': {
                        'path': '$topics',
                        'includeArrayIndex': 'topics_index_unwinded',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$group': {
                        '_id': {
                            'topic': '$topics.k',
                            'keywords': '$topics.v',
                            'group': '$labels.result.group',
                            'analysis': '$analysis.id',
                            'labeling': '$labels.id',
                        },
                        'avgSentiment': {
                            '$avg': '$analysis.result'
                        }
                    }
                }
            ]).allowDiskUse(true)
            return {
                themes: themes,
                groups: groups
            }
        } catch(e) {
            Boom.badRequest()
        }
    }
}
