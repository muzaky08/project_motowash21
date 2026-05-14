const db = require('../db/db');

exports.getGallery = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.addGallery = async (req, res, next) => {
  const { url, title } = req.body;
  
  if (!url || !title) {
    return res.status(400).json({ message: 'URL and Title are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO gallery (url, title) VALUES (?, ?)',
      [url, title]
    );
    
    res.status(201).json({
      id: result.insertId,
      url,
      title,
      created_at: new Date()
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteGallery = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM gallery WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    next(err);
  }
};
exports.updateGallery = async (req, res, next) => {
  const { id } = req.params;
  const { url, title } = req.body;

  if (!url || !title) {
    return res.status(400).json({ message: 'URL and Title are required' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE gallery SET url = ?, title = ? WHERE id = ?',
      [url, title, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json({ id, url, title, message: 'Gallery item updated successfully' });
  } catch (err) {
    next(err);
  }
};
