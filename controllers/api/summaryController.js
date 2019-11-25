const { Controller } = require('bak')
const Boom = require('boom')
const { Summary, Tweet } = require('../../models')

export default class TweetsController extends Controller {

    /**
     * Includes the routings for this controller
     */
    init () {
        this.post('/summary/update', this.addOrUpdateSummary)
        this.get('/summaries', this.getSummaries)
    }

    async getSummaries(request, h) {
        try {
            return await Summary.find()
        } catch (e) {
            Boom.badRequest()
        }
    }

    async addOrUpdateSummary(request, h) {
        try {
            // noinspection JSDeprecatedSymbols
            console.log('got a summary', request.payload.custom_theme, request.payload.custom_group)

            // Save the summary
            let summary = new Summary(request.payload);
            const summs = await Summary.find()
            let found = false
            for (const summ of summs) {
                // Check for themes
                if (summary.equals(summ))
                    found = true
                // Check for groups
            }
            if (!found)
                await summary.save()

            // Update the tweet
            let tweet = await Tweet.findOne({id_str: request.payload.tweet.id_str})
            tweet.labels = summary.labels
            tweet.labels.push({
                id: 'custom',
                title: 'User Customized Labeling',
                result: {
                    theme: summary.custom_theme,
                    group: summary.custom_group
                }
            })
            tweet.save()
            return 'OK'
        }
         catch (e) {
            Boom.badRequest()
        }
    }
}
