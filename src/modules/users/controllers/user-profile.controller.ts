import { Request, Response } from "express";
import { userProfileService } from "../services/user-profile.service";

export async function userProfileController(req: Request, res: Response) {
  const user = (req as any).user;
  const userId = user?.id;

  try {
    console.info({ module: 'user-profile-controller', userId, message: 'Request received' });
    const profile = await userProfileService.getProfile(Number(userId));

    // Use console as project logger fallback
    console.info({ module: "user-profile-controller", userId, message: "Perfil consultado" });

    return res.status(200).json(profile);
  } catch (error: any) {
    if (error && error.code === "USER_NOT_FOUND") {
      console.error({ module: "user-profile-controller", userId, error: error.message });
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }

    // ensure stack is logged for debugging
    console.error({ module: "user-profile-controller", userId, error: (error && (error.stack || error.message)) });
    return res.status(500).json({ message: "ERROR_INTERNAL" });
  }
}
