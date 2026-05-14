const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      message: 'Database authentication failed',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database error'
    });
  }

  if (err.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({
      message: 'Database not found',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database error'
    });
  }

  if (err.code && err.code.startsWith('ER_')) {
    return res.status(400).json({
      message: err.message || 'Database error',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }

  // Connection errors
  if (err.message && err.message.includes('ECONNREFUSED')) {
    return res.status(503).json({
      message: 'Database connection refused - database may not be running',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Connection error'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Auth error'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Auth error'
    });
  }

  // Generic error
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

module.exports = errorHandler;

