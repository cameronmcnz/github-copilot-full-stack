import { v4 as uuidv4 } from 'uuid';

function userMiddleware(req, res, next) {
  let userId = req.cookies.userId;

  if (!userId) {
    userId = uuidv4();
    res.cookie('userId', userId, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false
    });
  }

  req.userId = userId;
  next();
}

export { userMiddleware };
