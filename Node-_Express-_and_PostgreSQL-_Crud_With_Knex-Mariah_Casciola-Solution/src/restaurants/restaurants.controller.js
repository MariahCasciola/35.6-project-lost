const restaurantsService = require("./restaurants.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function restaurantExists(req, res, next) {
  const { restaurantId } = req.params;

  const restaurant = await restaurantsService.read(restaurantId);

  if (restaurant) {
    res.locals.restaurant = restaurant;
    return next();
  }
  next({ status: 404, message: `Restaurant cannot be found.` });
}

const VALID_PROPERTIES = ["address", "cuisine", "restaurant_name"];

async function hasValidProperties(req, res, next) {
  const { data: { address, cuisine, restaurant_name } = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
    });
  }
  next();
}

async function list(req, res, next) {
  const data = await restaurantsService.list();
  res.json({ data });
}

async function create(req, res, next) {
  restaurantsService
    .create(req.body.data)
    .then((data) => res.status(201).json({ data }));
}

async function update(req, res, next) {
  const updatedRestaurant = {
    ...res.locals.restaurant,
    ...req.body.data,
    restaurant_id: res.locals.restaurant.restaurant_id,
  };

  const data = await restaurantsService.update(updatedRestaurant);

  res.json({ data });
}

async function destroy(req, res, next) {
  // your solution here
  res.json({ data: {} });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  update: [
    hasValidProperties,
    asyncErrorBoundary(restaurantExists),
    asyncErrorBoundary(update),
  ],
  delete: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(destroy)],
};
