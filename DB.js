const mongoose = require("mongoose");
const { Schema } = mongoose;

const renderBoxSchema = new Schema({
  renderBoxIp: String,
  streamName: String,
  streamURL: String,
  encoderIp: String,
  gameMapped: String,
  gameSymbolId: Number,
  environment: String,
  renderId: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
});


const renderCollectionSchema = new Schema({
  developmentRenderBox: [renderBoxSchema],
  stagingRenderBox: [renderBoxSchema],
  productionRenderBox: [renderBoxSchema],
});


const RenderCollectionModel = mongoose.model("RenderCollection", renderCollectionSchema);

module.exports = { RenderCollectionModel };
