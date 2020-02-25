const { Controller } = require('bak')
const Boom = require('boom')
const { Tweet } = require('../../models')
// const fs = require('fs')

export default class TweetsController extends Controller {

    /**
     * Includes the routings for this controller
     */
    init () {
        this.post('/tweet/save', this.saveTweet)
        this.get('/tweets/', this.getTweetsWindow)
        this.get('/aggregate/users', this.getAggregateUsers)
        this.get('/aggregate/topics', this.getAggregateTopics)
        this.get('/aggregate/keywords', this.getAggregateKeywords)
        // Tweet.watch().
        // on('change', function(doc) { console.log(doc); }).
        // on('end', function() { console.log('Done!'); });
    }

    async saveTweet(request, h) {
        try {
            let tweet = new Tweet(request.payload.tweet);
            tweet['arrived_at'] = new Date().getTime()
            await tweet.save()
            return 'OK'
        } catch (e) {
            Boom.badRequest()
        }
    }

    async getTweetsWindow(request, h) {
        try {
            let from = new Date(+request.query.from)
            let to = new Date(+request.query.to || '')
            let tweets = Tweet.find({'created_at': {'$gte': from, '$lt': to}})
            return await tweets
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
                                'user': '$user',
                                'retweet_count': '$retweet_count',
                                'favorite_count': '$favorite_count',
                                'possibly_sensitive': '$possibly_sensitive',
                                'analysis': '$analysis',
                                'labels': '$labels'
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
            // const user_groups = await fs.readFile('user_groups.json', (err, data) => {
            //     if (err) throw err;
            //     return JSON.parse(data);
            // });
            // fs.writeFile('user_groups.json', JSON.stringify(user_groups), function (err) {
            //     if (err) throw err;
            //     console.log('Saved!');
            // });
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
            // fs.writeFile('group_topics.json', JSON.stringify(group_topics), function (err) {
            //     if (err) throw err;
            //     console.log('Saved!');
            // });
            // fs.writeFile('theme_topics.json', JSON.stringify(theme_topics), function (err) {
            //     if (err) throw err;
            //     console.log('Saved!');
            // });
            // const group_topics = await fs.readFile('group_topics.json', (err, data) => {
            //     if (err) throw err;
            //     return JSON.parse(data);
            // });
            // const theme_topics = await fs.readFile('theme_topics.json', (err, data) => {
            //     if (err) throw err;
            //     return JSON.parse(data);
            // });
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
            // fs.writeFile('themes.json', JSON.stringify(themes), function (err) {
            //             //     if (err) throw err;
            //             //     console.log('Saved!');
            //             // });
            //             // fs.writeFile('groups.json', JSON.stringify(groups), function (err) {
            //             //     if (err) throw err;
            //             //     console.log('Saved!');
            //             // });
            // const themes = await fs.readFile('themes.json', (err, data) => {
            //     if (err) throw err;
            //     return JSON.parse(data);
            // });
            // const groups = await fs.readFile('groups.json', (err, data) => {
            //     if (err) throw err;
            //     return JSON.parse(data);
            // });
            return {
                themes: themes,
                groups: groups
            }
        } catch(e) {
            Boom.badRequest()
        }
    }
}
