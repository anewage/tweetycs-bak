const { Controller } = require('bak')
const Boom = require('boom')
const { Summary } = require('../../models')

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
            let summary = new Summary(request.payload);

            const summs = await Summary.find()
            let found = false
            for (const summ of summs) {
                // Check for themes
                if(summary.equals(summ))
                    found = true
                // Check for groups
            }
            if (!found)
                await summary.save()
            return 'OK'
        } catch (e) {
            Boom.badRequest()
        }
    }
}
