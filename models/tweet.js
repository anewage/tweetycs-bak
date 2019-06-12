const {Model, Schema} = require('@bakjs/mongo')

/**
 * A real Tweet from Twitter's API
 */
class Tweet extends Model {
    static get $schema () {
        return {
            id: String,
            id_str: String,
            text: String,
            analysis: Array,
            labels: Array,
            cause_factors: Object,
            truncated: Boolean,
            entities: Object,
            metadata: Object,
            source: String,
            in_reply_to_status_id: String,
            in_reply_to_status_id_str: String,
            in_reply_to_user_id: String,
            in_reply_to_user_id_str: String,
            in_reply_to_screen_name: String,
            user: Object,
            geo: Object,
            coordinates: Object,
            place: Object,
            contributors: Object,
            retweeted_status: Object,
            is_quote_status: Boolean,
            retweet_count: Number,
            favorite_count: Number,
            favorited: Boolean,
            retweeted: Boolean,
            lan: String,
        }
    }
}

module.exports = Tweet.$model
