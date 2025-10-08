import { MiddlewareRoute } from "@medusajs/medusa";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

export const storePhotogrammetryMiddlewares: MiddlewareRoute[] = [
    {
        method: "POST",
        matcher: "/store/photogrammetry",
        middlewares: [upload.array('images', 10)], // Allow up to 10 images
    },
];