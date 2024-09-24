import { IAuthModuleService, IUserModuleService } from "@medusajs/types";
import { Modules } from "@medusajs/utils";
import jwt from "jsonwebtoken";
import Scrypt from "scrypt-kdf";

export const adminHeaders = {
  headers: {},
};

export const createAdminUser = async (adminHeaders, appContainer) => {
  const userModule: IUserModuleService = appContainer.resolve(Modules.USER);
  const authModule: IAuthModuleService = appContainer.resolve(Modules.AUTH);
  const user = await userModule.createUsers({
    first_name: "Admin",
    last_name: "User",
    email: "admin@medusa.js",
  });

  const hashConfig = { logN: 15, r: 8, p: 1 };
  const passwordHash = await Scrypt.kdf("somepassword", hashConfig);

  const authIdentity = await authModule.createAuthIdentities({
    provider_identities: [
      {
        provider: "emailpass",
        entity_id: "admin@medusa.js",
        provider_metadata: {
          password: passwordHash.toString("base64"),
        },
      },
    ],
    app_metadata: {
      user_id: user.id,
    },
  });

  const token = jwt.sign(
    {
      actor_id: user.id,
      actor_type: "user",
      auth_identity_id: authIdentity.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  adminHeaders.headers["authorization"] = `Bearer ${token}`;

  return { user, authIdentity };
};
