export interface User {
  id: string
  email: string
  password: string
  fullName: string
  createdAt: Date
  updatedAt: Date
}

export interface UserJWTDAO {
  id:string
  email:string
  fullName:string
  role:string
}

export interface UserLoginDTO {
  email:string
  password:string
}

export interface UserRegisterDTO {
  fullName:string
  email:string
  password:string
}

export interface AuthResponse {
  user: UserJWTDAO
  token: string
}

// Exclude keys from user
export function exclude<User, Key extends keyof User>(
  user: User,
  ...keys: Key[]
): Omit<User, Key> {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}