const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: err.message });
  };
  
  module.exports = errorHandler;
  