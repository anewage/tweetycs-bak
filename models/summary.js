const {Model, Schema} = require('@bakjs/mongo')

/**
 * A reduction of a tweet
 */
class Summary extends Model {
    static get $schema () {
        return {
            labels: Array,
            custom_theme: String,
            custom_group: String
        }
    }

    equals(summ, context = ['group', 'theme']) {
        // List of methods that produced labels for this document
        const methodsToCheck = this.labels.filter(l => l.id !== 'custom').map(a => a.id)
        for (const method of methodsToCheck) {
            // Labels produced by this specific method
            const thisLabel = this.labels.find(lbl => lbl.id === method)
            const thatLabel = summ.labels.find(lbl => lbl.id === method)
            if (thatLabel) {
                for (const item of context)
                    if (thisLabel.result[item] !== thatLabel.result[item])
                        return false
            } else
                return false
        }
        return true
    }
}

module.exports = Summary.$model
