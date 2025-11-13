"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return;

    const existingUser = await prisma.user.findUnique({ where: { clerkUserId: user.id } });
    if (existingUser) return existingUser;

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      throw new Error("User email is required");
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        firstName: user.firstName || "Unknown",
        lastName: user.lastName || "User",
        email: email,
        phone: user.phoneNumbers[0]?.phoneNumber || null
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser server action", error);
  }
}
