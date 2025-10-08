import { MiddlewareRoute } from "@medusajs/medusa";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

export const storeSolarDetectionMiddlewares: MiddlewareRoute[] = [
    {
        method: "POST",
        matcher: "/store/solar-detection",
        middlewares: [upload.single('image')],
    },
];