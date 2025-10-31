const { Router } = require("express");
const axios = require("axios");
const { RenderCollectionModel } = require("../DB");
const renderRouter = Router();
const mongoose = require("mongoose");

// --- CREATE new render box ---
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
      renderId: new mongoose.Types.ObjectId(),
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

// --- FETCH all render boxes ---
renderRouter.get("/getAllRenderBoxes", async (req, res) => {
  try {
    const renderCollection = await RenderCollectionModel.findOne();

    if (!renderCollection) {
      return res.status(404).json({
        message: "No render boxes found",
        data: {},
      });
    }

    const result = {
      development: renderCollection.developmentRenderBox || [],
      staging: renderCollection.stagingRenderBox || [],
      production: renderCollection.productionRenderBox || [],
    };

    res.status(200).json({
      message: "Render boxes fetched successfully",
      data: result,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching render boxes:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// --- UPDATE a specific render box ---
renderRouter.put("/updateRenderBox/:environment/:renderId", async (req, res) => {
  try {
    const { environment, renderId } = req.params;
    const {
      streamName,
      streamURL,
      encoderIp,
      gameMapped,
      gameSymbolId,
      environment: newEnvironment,
    } = req.body;

    const envKey = `${environment.toLowerCase()}RenderBox`;

    if (!["developmentRenderBox", "stagingRenderBox", "productionRenderBox"].includes(envKey)) {
      return res.status(400).json({
        message: "Invalid environment. Must be Development, Staging, or Production",
      });
    }

    const doc = await RenderCollectionModel.findOne();
    if (!doc) return res.status(404).json({ message: "Render collection not found" });

    const boxIndex = doc[envKey].findIndex(
      (item) => item.renderId.toString() === renderId
    );

    if (boxIndex === -1)
      return res.status(404).json({
        message: `Render box with id ${renderId} not found in ${environment}`,
      });

    // Update fields if provided
    if (streamName) doc[envKey][boxIndex].streamName = streamName;
    if (streamURL) doc[envKey][boxIndex].streamURL = streamURL;
    if (encoderIp) doc[envKey][boxIndex].encoderIp = encoderIp;
    if (gameMapped) doc[envKey][boxIndex].gameMapped = gameMapped;
    if (gameSymbolId) doc[envKey][boxIndex].gameSymbolId = gameSymbolId;
    if (newEnvironment) doc[envKey][boxIndex].environment = newEnvironment;

    await doc.save();

    res.status(200).json({
      message: `Render box in ${environment} updated successfully`,
      updatedBox: doc[envKey][boxIndex],
      status: 200,
    });
  } catch (error) {
    console.error("Error updating render box:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// --- GET individual render box status ---
renderRouter.get("/getRenderBoxStatus/:renderBoxIp", async (req, res) => {
  const { renderBoxIp } = req.params;

  try {
    const response = await axios.get(`http://${renderBoxIp}/status`, { timeout: 5000 });

    res.status(200).json({
      message: "Status fetched successfully",
      renderBoxIp,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to fetch status from ${renderBoxIp}`,
      error: error.message,
    });
  }
});

// --- REFRESH all render boxes status ---
renderRouter.get("/refreshAllRenderBoxStatus", async (req, res) => {
  try {
    const doc = await RenderCollectionModel.findOne();
    if (!doc) return res.status(404).json({ message: "No render boxes found" });

    const allBoxes = [
      ...(doc.developmentRenderBox || []),
      ...(doc.stagingRenderBox || []),
      ...(doc.productionRenderBox || []),
    ];

    const results = [];

    for (const box of allBoxes) {
      const { renderBoxIp, environment, streamName } = box;
      try {
        const response = await axios.get(`http://${renderBoxIp}/status`, { timeout: 5000 });
        results.push({
          renderBoxIp,
          streamName,
          environment,
          status: "Success",
          data: response.data,
        });
      } catch (err) {
        console.warn(`Failed to fetch status from ${renderBoxIp}: ${err.message}`);
      }
    }

    // Group by environment
    const groupedByEnvironment = results.reduce((acc, item) => {
      if (!acc[item.environment]) acc[item.environment] = [];
      acc[item.environment].push(item);
      return acc;
    }, {});

    res.status(200).json({
      message: "Refreshed all successful render box statuses",
      totalSuccess: results.length,
      data: groupedByEnvironment,
    });
  } catch (error) {
    console.error("Error refreshing render box statuses:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = { renderRouter };
