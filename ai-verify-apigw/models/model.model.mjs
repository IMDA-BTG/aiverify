import { Schema, model } from "mongoose";
import _ from "lodash";
import Enforcer from 'openapi-enforcer';

const PRIMITIVE_TYPES = ["string", "number", "integer", "boolean"];
const ALL_TYPES = [...PRIMITIVE_TYPES, "array", "object"];

const MEDIA_TYPES = [
  "none",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "application/json",
  "text/plain",
];

const modelAPIAdditionalHeadersSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: PRIMITIVE_TYPES },
  value: { type: Object, required: true },
});

const modelAPIParametersPathSchema = new Schema({
  mediaType: {
    type: String,
    required: true,
    enum: MEDIA_TYPES,
    default: "none",
  },
  isArray: { type: Boolean, required: true, default: false },
  maxItems: { type: Number }, // max array items if itemType == 'array'
  pathParams: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true, enum: PRIMITIVE_TYPES },
    },
  ],
});

const modelAPIParametersQuerySchema = new Schema({
  mediaType: { type: String, required: true, enum: MEDIA_TYPES },
  name: { type: String },
  isArray: { type: Boolean, required: true, default: false },
  maxItems: { type: Number }, // max array items if itemType == 'array'
  queryParams: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true, enum: PRIMITIVE_TYPES },
    },
  ],
});

const modelAPIParametersSchema = new Schema({
  paths: modelAPIParametersPathSchema,
  queries: modelAPIParametersQuerySchema,
});

const modelAPIRequestBodySchema = new Schema({
  mediaType: {
    type: String,
    required: true,
    enum: MEDIA_TYPES,
  },
  isArray: { type: Boolean, required: true, default: false },
  name: { type: String },
  maxItems: { type: Number }, // max array items if itemType == 'array'
  properties: [
    {
      field: { type: String, required: true },
      type: { type: String, required: true, enum: PRIMITIVE_TYPES },
    },
  ],
});

const modelAPISchema = new Schema({
  method: { type: String, required: true, enum: ["POST", "GET"] },
  url: { type: String, required: true },
  urlParams: { type: String },
  authType: {
    type: String,
    required: true,
    enum: ["No Auth", "Bearer Token", "Basic Auth"],
    default: "No Auth",
  },
  authTypeConfig: { type: Object },
  additionalHeaders: [modelAPIAdditionalHeadersSchema],
  parameters: modelAPIParametersSchema,
  requestBody: modelAPIRequestBodySchema,
  response: {
    statusCode: { type: Number, required: true, default: 200 },
    mediaType: {
      type: String,
      required: true,
      enum: ["text/plain", "application/json"],
    },
    schema: { type: Object, required: true },
    // type: { type: String, required: true, enum: ALL_TYPES, default: "integer" },
    // field: { type: String }, // for object, define the prediction field use dot, e.g. xxx.yyy, to denote nested field
    // objectType: { type: String, enum: ALL_TYPES },
    // arrayType: { type: String, enum: ALL_TYPES },
  },
  requestConfig: {
    sslVerify: { type: Boolean, default: true },
    connectionTimeout: { type: Number, default: -1 },
    rateLimit: { type: Number, default: -1 },
    rateLimitTimeout: { type: Number, default: -1 },
    batchLimit: { type: Number, default: -1 },
    connectionRetries: { type: Number, default: 3 },
    maxConnections: { type: Number, default: -1 },
    batchStrategy: {
      type: String,
      enum: ["none", "multipart"],
    },
  },
});

const modelFileSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      default: "File",
      enum: ["File", "Folder", "Pipeline", "API"],
    },
    filename: { type: String }, // for non-API type
    filePath: { type: String }, // for non-API type
    modelAPI: {
      type: modelAPISchema,
      validate: {
        validator: function (api) {
          return new Promise(async (resolve, reject) => {
            try {
              const spec = await _exportModelAPI(api);
              if (spec) resolve(true);
              else reject(new Error("Invalid model API"));
            } catch (err) {
              reject(err);
            }
          });
        },
        message: (props) => `ModelAPI is invalid`,
      },
    }, // for API type
    ctime: { type: Date },
    description: { type: String, required: false },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Valid", "Invalid", "Error", "Cancelled", "Temp"],
    },
    size: { type: String },
    modelType: {
      type: String,
      required: false,
      enum: ["Classification", "Regression"],
    },
    serializer: { type: String },
    modelFormat: { type: String },
    errorMessages: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// very simple URL regex match
// const _url_pattern = /^(?<base>https?:\/\/(?:[a-z0-9.@:])+)(?<path>\/?[^?]+)(?<query>\?\/?.+)?/i;
const _url_path_pattern = /\{([a-z0-9_\-\s]+)\}/gi;

modelFileSchema.methods.exportModelAPI = async function () {
  if (this.type !== "API") {
    throw new Error("Model is not of type API");
  }
  return _exportModelAPI(this.modelAPI);
};

async function _exportModelAPI(modelAPI) {
  // const modelAPI = this.modelAPI;
  // console.log("exportModelAPI", modelAPI)
  let spec = {
    openapi: "3.0.3",
    info: {
      title: "API-Based Testing",
      version: "1.0.0",
    },
  };

  // build the path
  let pathObj = {
    parameters: [],
    responses: {
      [modelAPI.response.statusCode]: {
        description: "successful operation",
        content: {
          [modelAPI.response.mediaType]: {
            schema: modelAPI.response.schema,
          },
        },
      },
    },
  };

  // const url = modelAPI.url + (modelAPI.urlParams || "");
  let urlstr = modelAPI.url;
  if (urlstr.endsWith('/')) {
    urlstr = urlstr.replace(/(\/+)$/, '');
  }
  urlstr = urlstr + (modelAPI.urlParams || "");
  const url = new URL(urlstr);
  const urlBase = url.protocol + "//"  + url.host;
  const urlPathname = decodeURIComponent(url.pathname);
  // add servers
  spec["servers"] = [
    {
      url: urlBase,
    },
  ];

  // add auth if any
  switch (modelAPI.authType) {
    case "Bearer Token":
      spec["components"] = {
        securitySchemes: {
          myAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      };
      pathObj["security"] = [{ myAuth: [] }];
      break;
    case "Basic Auth":
      spec["components"] = {
        securitySchemes: {
          myAuth: {
            type: "http",
            scheme: "basic",
          },
        },
      };
      pathObj["security"] = [{ myAuth: [] }];
      break;
  }

  // add additional headers if any
  if (modelAPI.additionalHeaders && modelAPI.additionalHeaders.length > 0) {
    for (let p of modelAPI.additionalHeaders) {
      pathObj.parameters.push({
        in: "header",
        name: p.name,
        required: true,
        schema: {
          type: p.type,
          enum: [p.value],
        },
      });
    }
  }

  // add path params if any
  const path_match = urlPathname.match(_url_path_pattern);
  // console.log("path_match", path_match);
  if (
    path_match &&
    modelAPI.parameters &&
    modelAPI.parameters.paths &&
    modelAPI.parameters.paths.pathParams &&
    modelAPI.parameters.paths.pathParams.length > 0
  ) {
    // const parameters = [];
    const isComplex = modelAPI.parameters.paths.mediaType !== "none";
    if (!isComplex) {
      for (let item of path_match) {
        let attr = item.replaceAll(/[{}]/g, "");
        const p = modelAPI.parameters.paths.pathParams.find(
          (p) => p.name === attr
        );
        if (!p) {
          throw new Error(`Path parameter {${attr}} not defined`);
        }
        let pobj = {
          in: "path",
          name: p.name,
          required: true,
          schema: {
            type: p.type,
          },
        };
        pathObj.parameters.push(pobj);
      }
    } else {
      if (path_match.length != 1) {
        // impose condition of only one path param for objects
        throw new Error("Require one path variable for complex serialization");
      }
      let name = path_match[0].replaceAll(/[{}]/g, "");
      if (!name || name.length == 0) {
        throw new Error(
          "Name field required for parameters with complex serialization"
        );
      }
      const properties = {};
      const required = [];
      for (let p of modelAPI.parameters.paths.pathParams) {
        properties[p.name] = {
          type: p.type,
        };
        required.push(p.name);
      }
      const objectDefinition = {
        type: "object",
        properties,
        required,
      };
      if (modelAPI.parameters.paths.isArray) {
        const schema = {
          type: "array",
          items: objectDefinition,
        };
        if (modelAPI.parameters.paths.maxItems) {
          schema.maxItems = modelAPI.parameters.paths.maxItems;
        }
        pathObj.parameters.push({
          in: "path",
          name,
          required: true,
          content: {
            [modelAPI.parameters.paths.mediaType]: {
              schema,
            },
          },
        });
      } else {
        pathObj.parameters.push({
          in: "path",
          name,
          required: true,
          content: {
            [modelAPI.parameters.paths.mediaType]: {
              schema: objectDefinition,
            },
          },
        });
      }
    }
  } else if (path_match && path_match.length > 0) {
    throw new Error("Path parameters not defined");
  } else if (!path_match && (modelAPI.parameters && modelAPI.parameters.paths)) {
    throw new Error("urlParams not defined for paths");
  }

  // add query params if any
  if (
    modelAPI.parameters &&
    modelAPI.parameters.queries &&
    modelAPI.parameters.queries.queryParams &&
    modelAPI.parameters.queries.queryParams.length > 0
  ) {
    // has query params
    const isComplex = modelAPI.parameters.queries.mediaType && modelAPI.parameters.queries.mediaType !== "none";
    if (!isComplex) {
      for (let p of modelAPI.parameters.queries.queryParams) {
        let pobj = {
          in: "query",
          name: p.name,
          required: true,
          schema: {
            type: p.type,
          },
        };
        pathObj.parameters.push(pobj);
      }
    } else {
      if (
        !modelAPI.parameters.queries.name ||
        modelAPI.parameters.queries.name.length == 0
      ) {
        throw new Error(
          "Name field required for parameters with complex serialization"
        );
      }
      const name = modelAPI.parameters.queries.name;
      const properties = {};
      const required = [];
      for (let p of modelAPI.parameters.queries.queryParams) {
        properties[p.name] = {
          type: p.type,
        };
        required.push(p.name);
      }
      const objectDefinition = {
        type: "object",
        properties,
        required,
      };
      if (modelAPI.parameters.queries.isArray) {
        const schema = {
          type: "array",
          items: objectDefinition,
        };
        if (modelAPI.parameters.queries.maxItems) {
          schema.maxItems = modelAPI.parameters.queries.maxItems;
        }
        pathObj.parameters.push({
          in: "query",
          name,
          content: {
            [modelAPI.parameters.queries.mediaType]: {
              schema,
            },
          },
        });
      } else {
        pathObj.parameters.push({
          in: "query",
          name,
          content: {
            [modelAPI.parameters.queries.mediaType]: {
              schema: objectDefinition,
            },
          },
        });
      }
    }
  }

  // add request body if any
  if (modelAPI.requestBody && modelAPI.requestBody.mediaType !== "none") {
    if (modelAPI.method === 'GET') {
      throw new Error("GET methods cannot have a request body")
    }
    let required = [];
    let properties = {};
    for (let prop of modelAPI.requestBody.properties) {
      required.push(prop.field);
      properties[prop.field] = {
        type: prop.type,
      };
    }
    const objectDefinition = {
      type: "object",
      required,
      properties,
    };
    if (modelAPI.requestBody.isArray) {
      let schema = {
        type: "array",
        items: objectDefinition,
      };
      if (modelAPI.requestBody.name && modelAPI.requestBody.name.length > 0) {
        schema = {
          type: "object",
          properties: {
            [modelAPI.requestBody.name]: schema
          }
        }
      }
      if (modelAPI.requestBody.maxItems) {
        schema.maxItems = modelAPI.requestBody.maxItems;
      }
      pathObj["requestBody"] = {
        required: true,
        content: {
          [modelAPI.requestBody.mediaType]: {
            schema,
          },
        },
      };
    } else {
      pathObj["requestBody"] = {
        required: true,
        content: {
          [modelAPI.requestBody.mediaType]: {
            schema: objectDefinition,
          },
        },
      };
    }
  }

  spec["paths"] = {
    [urlPathname]: {
      [modelAPI.method.toLowerCase()]: pathObj,
    },
  };
  // const json = JSON.parse(spec.getSpecAsJson());
  // console.log("spec", JSON.stringify(spec, null, 2))
  // console.log("config", config)

  const [openapi, error, warning] = await Enforcer(spec, {
    fullResult: true
  })
  if (error !== undefined) throw new Error(error)
  if (warning !== undefined) console.warn(warning)
  if (!(openapi instanceof Enforcer.v3_0.OpenApi))
    throw new Error("Not 3.x OpenAPI schema")

  return spec;
}

export const ModelFileModel = model("ModelFileModel", modelFileSchema);
