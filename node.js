module.exports = (RED) => {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const main = function (config) {
    RED.nodes.createNode(this, config);
    this.Token = config.Token || "";
    const node = this;

    const genAI = new GoogleGenerativeAI(node.Token);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    node.on("input", async (msg) => {
      node.status({ fill: "green", shape: "dot", text: "処理中..." });
      try {
        const result = await model.generateContent(msg.payload);
        const response = await result.response;
        msg.payload = response.text();
        node.status({});
      } catch (error) {
        if (error.response) {
          node.status({
            fill: "red",
            shape: "dot",
            text: `${error.response.status}, ${JSON.stringify(
              error.response.data.error.message
            )}`,
          });
          msg.payload = `${error.response.status}, ${JSON.stringify(
            error.response.data.error.message
          )}`;
        } else {
          node.status({
            fill: "red",
            shape: "dot",
            text: `${error.type}, ${error.message}`,
          });
          msg.payload = `${error.type}, ${error.message}`;
        }
      }
      node.send(msg);
    });
  };

  RED.nodes.registerType("simple-gemini", main);
};
