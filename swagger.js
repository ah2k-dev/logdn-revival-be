const swaggerAutogen = require("swagger-autogen")();
const doc = {
  info: {
    title: "LOGDN-REVIVAL",
    description: "logdn-revival endpoints",
    version: "1.0.0",
  },
  host: "api.lodgn.app",
  basePath: "/",
  schemes: ["https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [],
};

const outputFile = "./swagger_output.json"; // Generated Swagger file
const endpointsFiles = ["./src/router/index.js"]; // Path to the API routes files

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger file generated");
});
