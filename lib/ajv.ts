import Ajv from "ajv";
import schema from "./dar.schema.json";
const ajv = new Ajv({ allErrors: true, strict: false });
export const validateDAR = ajv.compile(schema as any);
