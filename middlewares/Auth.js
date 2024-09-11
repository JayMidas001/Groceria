const jwt = require('jsonwebtoken');
const userModel = require(`../models/userModel`)
const merchModel = require(`../models/merchantModel`)

const authorize = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;

        if (!auth) {
            return res.status(401).json({
                message: 'Authorization required'
            });
        }

        const token = auth.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Action requires sign-in. Please log in to continue.'
            });
        }

        const decodedToken = jwt.verify(token, process.env.jwt_secret);

        const user = await merchModel.findById(decodedToken.userId);

        if (!user) {
            return res.status(404).json({
                message: 'Authentication Failed: User not found'
            });
        }

        if(!user.isAdmin){
            return res.status(403).json({
                message:`Authentication failed: User is not allowed to access this route.`
            })
        }

        // Check if the token is blacklisted
        if (user.blackList && user.blackList.includes(token)) {
          return res.status(401).json({ message: 'Token has been blacklisted. Please log in again.' });
      }

        req.user = user;

        next();

    } catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({ message: 'Token has expired. Please log in again.' });
		} else if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({ message: "Oops! Access denied. Please sign in." });
		}
		res.status(500).json({ message: error.message });
	}
};

const authenticate = async (req, res, next) => {
	try {
		const auth = req.headers.authorization;
		if (!auth) {
			return res.status(401).json({ message: 'Authorization required' });
		}

		const token = auth.split(' ')[1];
		if (!token) {
			return res.status(401).json({ message: 'Action requires sign-in. Please log in to continue.' });
		}

		const decodedToken = jwt.verify(token, process.env.jwt_secret);
		const user = await userModel.findById(decodedToken.userId);
		if (!user) {
			return res.status(404).json({ message: 'Authentication Failed: User not found' });
		}
    // Check if the token is blacklisted
    if (user.blackList && user.blackList.includes(token)) {
      return res.status(401).json({ message: 'Token has been blacklisted. Please log in again.' });
  }
		req.user = user; // Create a new user object and assign it to req.user
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({ message: 'Token has expired. Please log in again.' });
		} else if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({ message: "Oops! Access denied. Please sign in." });
		}
		res.status(500).json({ message: error.message });
	}
};

const isSuperAdmin = (req, res, next) => {
  try {
      // Ensure req.user exists before accessing properties
      if (!req.user) {
          return res.status(401).json({ message: 'User is not authenticated.' });
      }

      // Ensure isSuperAdmin property exists on user object
      if (!req.user.isSuperAdmin) {
          return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
      }

      // If the user is a super admin, allow them to proceed
      next();
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

  module.exports = {
    authorize,
    authenticate,
    isSuperAdmin
  };