import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth, currentUser } from "@clerk/nextjs/server";
import {prisma} from "@/lib/prisma";

const f = createUploadthing();

const handleTeacherAuth = async () => {
    try {
    const user = await currentUser();
        if (!user) {
            console.error("[UploadThing] No user found in session");
            throw new Error("Unauthorized - Please log in");
        }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        select: { role: true, id: true },
    });

        if (!dbUser) {
            console.error("[UploadThing] User not found in database for clerkId:", user.id);
            throw new Error("Unauthorized - User not found");
        }

        if (dbUser.role !== "teacher") {
            console.error("[UploadThing] User is not a teacher. Role:", dbUser.role);
            throw new Error("Unauthorized - Teacher access required");
        }

    return { userId: dbUser.id };
    } catch (error) {
        console.error("[UploadThing] Auth error:", error);
        // Re-throw with a more user-friendly message if it's not already an Error
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Authentication failed");
    }
};

const handleStudentAuth = async () => {
    try {
        let clerkUserId: string | null = null;
        
        // Try auth() first for API route context
        try {
            const authResult = await auth();
            clerkUserId = authResult.userId;
        } catch (authError) {
            console.log("[UploadThing] auth() failed, trying currentUser()...", authError);
        }
        
        // Fallback to currentUser() if auth() doesn't work or returns no userId
        if (!clerkUserId) {
            try {
                const user = await currentUser();
                if (user) {
                    clerkUserId = user.id;
                }
            } catch (currentUserError) {
                console.error("[UploadThing] currentUser() also failed:", currentUserError);
                throw new Error("Unauthorized - Please log in");
            }
        }
        
        if (!clerkUserId) {
            console.error("[UploadThing] No user found in session");
            throw new Error("Unauthorized - Please log in");
        }

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { role: true, id: true },
        });

        if (!dbUser) {
            console.error("[UploadThing] User not found in database for clerkId:", clerkUserId);
            throw new Error("Unauthorized - User not found");
        }

        if (dbUser.role !== "student") {
            console.error("[UploadThing] User is not a student. Role:", dbUser.role);
            throw new Error("Unauthorized - Student access required");
        }

        // Get student record
        const student = await prisma.student.findUnique({
            where: { userId: dbUser.id },
            select: { id: true },
        });

        if (!student) {
            console.error("[UploadThing] Student record not found for userId:", dbUser.id);
            throw new Error("Unauthorized - Student record not found");
        }

        return { userId: dbUser.id, studentId: student.id };
    } catch (error) {
        console.error("[UploadThing] Auth error:", error);
        // Handle ClerkAPIResponseError specifically
        if (error && typeof error === 'object' && 'clerkError' in error) {
            console.error("[UploadThing] Clerk API error - user may need to refresh session");
            throw new Error("Authentication failed - Please refresh the page and try again");
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Authentication failed");
    }
};

export const ourFileRouter = {
    recommendationLetter: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 }, text: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            console.log("[UploadThing] Middleware called - starting auth");
            try {
                const result = await handleTeacherAuth();
                console.log("[UploadThing] Auth successful, userId:", result.userId);
                return result;
            } catch (error) {
                console.error("[UploadThing] Middleware auth failed:", error);
                throw error;
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("[UploadThing] Upload complete for userId:", metadata.userId);
            console.log("[UploadThing] File URL:", file.url);
            console.log("[UploadThing] File name:", file.name);
            return { uploadedBy: metadata.userId };
        }),
    studentDocument: f({ 
        pdf: { maxFileSize: "16MB", maxFileCount: 1 }, 
        image: { maxFileSize: "16MB", maxFileCount: 1 } 
    })
        .middleware(async () => {
            console.log("[UploadThing] Student document middleware called - starting auth");
            try {
                const result = await handleStudentAuth();
                console.log("[UploadThing] Student auth successful, userId:", result.userId, "studentId:", result.studentId);
                return result;
            } catch (error) {
                console.error("[UploadThing] Student middleware auth failed:", error);
                throw error;
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("[UploadThing] Student document upload complete for studentId:", metadata.studentId);
            console.log("[UploadThing] File URL:", file.url);
            console.log("[UploadThing] File name:", file.name);
            return { uploadedBy: metadata.userId, studentId: metadata.studentId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
