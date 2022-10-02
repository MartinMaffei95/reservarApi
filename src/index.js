const express = require('express');
require('dotenv').config();
const app = express();
const { Space } = require('./models/space');

// ROUTES
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const buildingRoutes = require('./routes/buildings');
const spaceRoutes = require('./routes/spaces');
const bookingRoutes = require('./routes/bookings');

//############################
// ## CONNECTING DB ##########
//############################

require('./connection');

//############################
// ## SERVER CONFIG ##########
//############################

app.set('PORT', process.env.PORT || 4000);
app.use(express.json());

//############################
// ## CONFIG ROUTES ##########
//############################

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/buildings', buildingRoutes);
app.use('/spaces', spaceRoutes);
app.use('/bookings', bookingRoutes);

// app.use('/users', userRoutes);

const date = ' 1/9/2022';

app.listen(app.get('PORT'), () => {
  console.log(`server listening on port ${app.get('PORT')}`);
});