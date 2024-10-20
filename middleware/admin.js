const adminCreationToken = "some_secure_token";
export const checkAdminCreationToken = (req, res, next) => {
    const { accountType, token } = req.body;
    if (accountType === 'admin' && token !== adminCreationToken) {
      return res.status(403).json({ error: 'Unauthorized to create admin account' });
    }
    next();
  };
