import { MiddlewareRoute } from "@medusajs/medusa";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

export const storeThermalAnalysisMiddlewares: MiddlewareRoute[] = [
  {
    method: "POST",
    matcher: "/store/thermal-analysis",
    middlewares: [upload.single('thermalImage')],
  },
];