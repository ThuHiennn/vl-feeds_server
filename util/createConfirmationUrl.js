module.exports = (token) => {
  return `${process.env.CLIENT_URL}/user/confirm/${token}`;
};
