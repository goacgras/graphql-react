const Event = require('../../models/event');
const { transformEvent } = require('./merge');

module.exports = {
    //ADD RETURN TO TELL GRAPHQL ITS ASYNC CODE SAME AS ASYNC/AWAIT
    events: () => {
        //add return to tell graphql is async and wait till finish
        return Event.find()
            .then((events) => {
                return events.map((event) => {
                    return transformEvent(event);
                });
            })
            .catch((err) => {
                throw err;
            });
    },
    createEvent: (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5fbf24d508089c1a04171454'
        });
        let createdEvent;
        //so graphql knows if this resolver executes async and it will wait to complete
        return event
            .save()
            .then((data) => {
                createdEvent = transformEvent(data);
                return User.findById('5fbf24d508089c1a04171454');
            })
            .then((foundUser) => {
                if (!foundUser) {
                    throw new Error('User not found');
                }
                //pass the event object to user
                foundUser.createdEvents.push(event);
                return foundUser.save();
            })
            .then(() => {
                return createdEvent;
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
    }
};
