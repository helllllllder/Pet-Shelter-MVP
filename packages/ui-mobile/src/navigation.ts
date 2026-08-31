export const NAVIGATION_ROUTES = {
  DASHBOARD: "Dashboard",
  PETS: "Pets",
  PET_DETAIL: "PetDetail",
  PET_REGISTER: "PetRegister",
  VETERINARY: "Veterinary",
  CARE_SCHEDULE: "CareSchedule",
  PROFILE: "Profile",
} as const;

export type RootDrawerParamList = {
  [NAVIGATION_ROUTES.DASHBOARD]: undefined;
  [NAVIGATION_ROUTES.PETS]: undefined;
  [NAVIGATION_ROUTES.PET_DETAIL]: { petId: string };
  [NAVIGATION_ROUTES.PET_REGISTER]: undefined;
  [NAVIGATION_ROUTES.VETERINARY]: undefined;
  [NAVIGATION_ROUTES.CARE_SCHEDULE]: undefined;
  [NAVIGATION_ROUTES.PROFILE]: undefined;
};
