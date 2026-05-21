const webpush = require("web-push");
const { cors } = require("./_lib/admin");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  // One-time use endpoint — delete after copying the keys
  const keys = webpush.generateVAPIDKeys();
  res.json(keys);
};
