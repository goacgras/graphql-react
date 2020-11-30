const Booking = require('../../models/booking');
const Event = require('../../models/event');

const { transformEvent, transformBooking } = require('./merge');

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map((booking) => {
                return transformBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async (args) => {
        const foundEvent = await Event.findOne({ _id: args.eventId });
        const newBooking = new Booking({
            user: '5fbf26e9e6475b12e02efd59',
            event: foundEvent
        });
        const result = await newBooking.save();
        return transformBooking(result);
    },
    cancelBooking: async (args) => {
        try {
            const foundBooking = await Booking.findById(args.bookingId);
            const event = transformEvent(foundBooking._doc.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (err) {
            console.log(err);
        }
    }
};
