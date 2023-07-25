const router = require("express").Router();
const path = require("path");

router.post("/", (req, res) => {
    // #swagger.tags = ['Uploader']
  if (req.files === null || req.files === undefined) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  const { file } = req.files; 
  const filePath = `/files/${file.name}`;
  file.mv(path.join(__dirname, `../../files`, file.name), (err) => {
    if (err) {
      console.log(err);
      return res.json({ err }); 
    }
  });
  return res.json({ filePath });
});
 
module.exports = router;  