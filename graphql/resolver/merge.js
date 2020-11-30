const { dateToString } = require('../../util/date');

const transformBooking = (booking) => {
    return {
        ...booking._doc,
        user: {
            ...booking._doc.user._doc,
            password: null
        },
        event: {
            ...booking._doc.event._doc
        },
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
};

const transformEvent = (event) => {
    return {
        ...event._doc,
        //NO NEED TO USE THIS
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: {
            ...event._doc.creator._doc,
            password: null
        }
    };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
