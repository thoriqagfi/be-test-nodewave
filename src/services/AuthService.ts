import bcrypt from 'bcrypt';
import { INTERNAL_SERVER_ERROR_SERVICE_RESPONSE, ServiceResponse, BadRequestWithMessage } from "$entities/Service";
import { UserLoginDTO, UserRegisterDTO, AuthResponse, UserJWTDAO } from "$entities/User";
import { generateAccessToken, verifyRefreshToken } from "$utils/jwt.utils";
import Logger from '$pkg/logger';
import { prisma } from '$utils/prisma.utils';

export async function register(userData: UserRegisterDTO): Promise<ServiceResponse<{}>> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
        return BadRequestWithMessage("User with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        role: 'USER'
      }
    });

    // Create JWT payload
    const jwtPayload: UserJWTDAO = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    };

    // Generate tokens
    const accessToken = generateAccessToken(jwtPayload);
    // const refreshToken = generateRefreshToken(jwtPayload);

    // Store refresh token in database (optional but recommended)
    // await prisma.refreshToken.create({
    //     data: {
    //         token: refreshToken,
    //         userId: newUser.id,
    //         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    //     }
    // });

    const authResponse: AuthResponse = {
      user: jwtPayload,
      token: accessToken
    };

    return {
      status: true,
      data: authResponse
    };

  } catch (err) {
    Logger.error(`AuthService.register: ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

export async function login(loginData: UserLoginDTO): Promise<ServiceResponse<{}>> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: loginData.email }
    });

    if (!user) {
      return BadRequestWithMessage("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      return BadRequestWithMessage("Invalid email or password");
    }

    // Create JWT payload
    const jwtPayload: UserJWTDAO = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };

    // Generate tokens
    const accessToken = generateAccessToken(jwtPayload);
    // const refreshToken = generateRefreshToken(jwtPayload);
    // Store refresh token in database
    // await prisma.refreshToken.create({
    //   data: {
    //     token: refreshToken,
    //     userId: user.id,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    //   }
    // });

    const authResponse: AuthResponse = {
      user: jwtPayload,
      token: accessToken
    };

    return {
      status: true,
      data: authResponse
    };

  } catch (err) {
    Logger.error(`AuthService.login: ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

export async function refreshToken(refreshToken: string): Promise<ServiceResponse<{}>> {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
        return BadRequestWithMessage("Invalid refresh token");
    }

    // Check if refresh token exists in database and is not expired
    // const storedToken = await prisma.refreshToken.findFirst({
    //     where: {
    //         token: refreshToken,
    //         expiresAt: { gt: new Date() }
    //     },
    //     include: { user: true }
    // });

    // For demo purposes, we'll just use the decoded token
    const jwtPayload: UserJWTDAO = decoded as UserJWTDAO;

    // Generate new access token
    const newAccessToken = generateAccessToken(jwtPayload);

    return {
      status: true,
      data: { accessToken: newAccessToken }
    };

  } catch (err) {
    Logger.error(`AuthService.refreshToken: ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}