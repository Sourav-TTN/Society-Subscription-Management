export type UserType = {
  name: string;
  email: string;
  userId: string;
  password: string;
  isVerified: boolean;
  otp: number | null;
  createdAt: Date;
  updatedAt: Date;
};
