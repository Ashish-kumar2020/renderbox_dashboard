const { Router } = require("express");
const { RenderCollectionModel } = require("../DB");
const renderRouter = Router();

renderRouter.post("/createRenderBox", async (req, res) => {
  try {
    const {
      renderBoxIp,
      streamName,
      streamURL,
      encoderIp,
      gameMapped,
      gameSymbolId,
      environment,
    } = req.body;

    if (
      !renderBoxIp ||
      !streamName ||
      !streamURL ||
      !encoderIp ||
      !gameMapped ||
      !gameSymbolId ||
      !environment
    ) {
      return res.status(400).json({
        message: "All Fields Are Mandatory and should be in correct Format",
      });
    }

    const envKey = `${environment.toLowerCase()}RenderBox`;

    let doc = await RenderCollectionModel.findOne();
    if (!doc) doc = new RenderCollectionModel();

    if (!doc[envKey]) doc[envKey] = [];
    doc[envKey].push({
      renderBoxIp,
      streamName,
      streamURL,
      encoderIp,
      gameMapped,
      gameSymbolId,
      environment,
    });

    await doc.save();

    res.status(200).json({
      message: `Render Box added to ${environment} successfully`,
      data: doc,
      status: 200,
    });
  } catch (error) {
    console.error("Error creating render box:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = { renderRouter };
