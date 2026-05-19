import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password, ...rest } = registerDto;

    const existing = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existing) {
      throw new ConflictException('Email or phone already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = this.userRepository.create({
      ...rest,
      email,
      phone,
      passwordHash,
      otpCode: otp,
      otpExpiresAt,
      status: UserStatus.PENDING,
    });

    await this.userRepository.save(user);

    // TODO: Send OTP via SMS/Email
    console.log(`OTP for ${email}: ${otp}`);

    return {
      message: 'Registration successful. Please verify your OTP.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended. Contact support.');
    }

    return this.generateTokens(user);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { userId, otp } = verifyOtpDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    await this.userRepository.update(userId, {
      otpCode: null,
      otpExpiresAt: null,
      phoneVerified: true,
      status: UserStatus.ACTIVE,
    });

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = this.generateOtp(6);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // TODO: Send email
    console.log(`Password reset OTP for ${dto.email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: dto.token },
    });

    if (!user || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    await this.userRepository.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Password reset successfully' };
  }

  async googleLogin(googleUser: any) {
    let user = await this.userRepository.findOne({
      where: { googleId: googleUser.id },
    });

    if (!user) {
      user = await this.userRepository.findOne({
        where: { email: googleUser.email },
      });

      if (user) {
        await this.userRepository.update(user.id, {
          googleId: googleUser.id,
        });
      } else {
        user = this.userRepository.create({
          name: googleUser.displayName,
          email: googleUser.email,
          googleId: googleUser.id,
          profileImage: googleUser.photo,
          emailVerified: true,
          status: UserStatus.ACTIVE,
        });
        await this.userRepository.save(user);
      }
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', 'rydo-refresh'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    await this.userRepository.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    };
  }

  private generateOtp(length = 6): string {
    return Math.floor(Math.random() * 10 ** length)
      .toString()
      .padStart(length, '0');
  }
}
