const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

exports.getAllServices = async (req, res, next) => {
  try {
    const [services] = await db.execute('SELECT * FROM services');
    res.json(services);
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  const { name, description, price, image_url } = req.body;
  try {
    const id = uuidv4();
    await db.execute(
      'INSERT INTO services (id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [id, name, description, price, image_url]
    );
    res.status(201).json({ id, name, description, price, image_url });
  } catch (err) {
    next(err);
  }
};
