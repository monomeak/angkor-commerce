import { profileSchema, type ValidatedProfile } from "../schemas/profile.schema";
import { dummyUserResponse } from "../types/dummy-user";

export function getProfileResponse(): ValidatedProfile {
  return profileSchema.parse(dummyUserResponse);
}
