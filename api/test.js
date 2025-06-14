// api/test.js
module.exports = async (req, res) => {
    res.json({ message: "Test endpoint funcionando", method: req.method });
  };