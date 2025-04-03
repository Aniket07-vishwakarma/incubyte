const {
  compareExcel,
  compareDocs,
  comparePdf,
} = require("../controllers/compareFile");

module.exports.compareFile = async (req, res) => {
  try {
    let response;

    if (req.body.fileType === "pdf") {
      response = await comparePdf(req);
    } else if (req.body.fileType === "docs") {
      response = await compareDocs(req);
    } else if (req.body.fileType === "xlsx") {
      response = await compareExcel(req);
    } else {
      return res.status(400).json({
        name: "FileTypeNotAvailable",
        message: "Comparison of this file type is not implemented",
        fileType: req.body.fileType,
      });
    }

    res.status(200).send({
      fileType: req.body.fileType,
      copmparedResponse: response.copmparedResponse,
    });
  } catch (error) {
    res.status(400).json({ name: error.name, message: error.message });
  }
};
