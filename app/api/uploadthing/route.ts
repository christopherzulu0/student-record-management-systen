import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const runtime = 'nodejs';

export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
    onError: ({ error, message }) => {
        console.error("[UploadThing] Route handler error:", error);
        console.error("[UploadThing] Error message:", message);
    },
});
