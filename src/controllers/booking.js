const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY; // private key for jsonWebToken
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Space = require('../models/space');
const Building = require('../models/building');
const Booking = require('../models/booking');
const { isValidObjectId, Types } = require('mongoose');

// to do:
//- when acept reservation need confirms that user is admin

// get a specific building
const getBooking = (req, res) => {
  const { id } = req.params;

  jwt.verify(req.token, SECRET_KEY, async (err, userData) => {
    if (err) {
      return res.status(501).json({
        message: 'TOKEN_ERROR',
        error: err,
      });
    }

    let booking = await Booking.findById(id);
    if (!booking) {
      return res.status(501).json({
        message: 'BOOKING_NOT_FOUND',
        booking,
      });
    }

    if (booking) {
      return res.status(200).json({
        message: 'BOOKING_FOUND',
        booking,
      });
    }
  });
};

// create a boooking
const createABooking = (req, res) => {
  const { time, building, space } = req.body;
  let { date } = req.body;

  if (!date) {
    return res.status(500).json({
      message: 'DATE_IS_REQUIRED',
    });
  }

  if (!time) {
    return res.status(500).json({
      message: 'TIME_IS_REQUIRED',
    });
  }

  if (!building) {
    return res.status(500).json({
      message: 'BUILDING_IS_REQUIRED',
    });
  }

  if (!space) {
    return res.status(500).json({
      message: 'SPACE_IS_REQUIRED',
    });
  }

  date = Date.parse(date);
  jwt.verify(req.token, SECRET_KEY, async (err, userData) => {
    if (err) {
      return res.status(501).json({
        message: 'TOKEN_ERROR',
        error: err,
      });
    }

    let spaceVerif = await Space.findById(space);
    if (!spaceVerif) {
      return res.status(501).json({
        message: 'SPACE_NOT_EXIST',
        error: err,
      });
    }
    let buildingVerif = await Building.findById(building);
    if (!buildingVerif) {
      return res.status(501).json({
        message: 'BUILDING_NOT_EXIST',
        error: err,
      });
    }

    Space.findById(space, (err, space) => {
      if (err) {
        return res.status(501).json({
          message: 'SPACE_ERROR',
          error: err,
        });
      }

      Booking.populate(space, { path: 'bookings' }, (err, populatedSpace) => {
        //verify exists another booking with the same date, building and space
        if (
          populatedSpace.bookings.find(
            (reservation) =>
              reservation.date === date &&
              reservation.time === time &&
              reservation.building == building &&
              reservation.space == req.body.space
          )
        ) {
          return res.status(501).json({
            message: 'HAVE_ANOTHER_RESERVATION',
            reservation: populatedSpace.bookings,
          });
        }

        // CREATE RESERVATION
        const newId = Types.ObjectId();
        const reservation = new Booking({
          _id: newId,
          date,
          time,
          building,
          space,
          bookedBy: userData.user._id,
        });

        // -- SAVING RESERVATION --
        reservation.save(async (err, result) => {
          if (err) {
            return res.status(501).json({
              message: 'ERROR_SAVING_SPACE',
              error: err?.errors,
            });
          } else {
            await Space.findByIdAndUpdate(
              space._id,
              { $push: { bookings: newId } },
              { returnOriginal: false }
            );
            return res.status(200).json({
              message: 'BOOKING_CREATED',
              booking: reservation,
              space,
            });
          }
        });
      });
    });
  });
};

module.exports = {
  createABooking,
  getBooking,
};
