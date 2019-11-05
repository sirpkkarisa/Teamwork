const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(
      token,
      process.env.TOKEN,
    );
    const { employeeId } = decodedToken;
    if (req.body.id && req.body.id !== employeeId) {
      // eslint-disable-next-line no-throw-literal
      throw 'Invalid user Id';
    } else {
      next();
    }
  } catch (e) {
    res.status(401)
      .json({
        error: new Error('Invalid request'),
      });
  }
};
