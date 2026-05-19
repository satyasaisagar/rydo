import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'rydo_user',
  password: process.env.DB_PASSWORD || 'rydo_password',
  database: process.env.DB_NAME || 'rydo_db',
  entities: ['src/**/*.entity.ts'],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Starting database seed...');

  const userRepo    = AppDataSource.getRepository('users');
  const vehicleRepo = AppDataSource.getRepository('vehicles');
  const rideRepo    = AppDataSource.getRepository('rides');

  // Seed admin
  const adminExists = await userRepo.findOne({ where: { email: 'admin@rydo.app' } });
  if (!adminExists) {
    const admin = userRepo.create({
      name:          'Rydo Admin',
      email:         'admin@rydo.app',
      phone:         '+919000000000',
      passwordHash:  await bcrypt.hash('Admin@123', 12),
      role:          'admin',
      status:        'active',
      emailVerified: true,
      phoneVerified: true,
      isVerified:    true,
    });
    await userRepo.save(admin);
    console.log('✅ Admin user created: admin@rydo.app / Admin@123');
  }

  // Seed demo rider
  const riderExists = await userRepo.findOne({ where: { email: 'rider@rydo.app' } });
  let rider: any;
  if (!riderExists) {
    rider = await userRepo.save(userRepo.create({
      name:          'Rahul Kumar',
      email:         'rider@rydo.app',
      phone:         '+919111111111',
      passwordHash:  await bcrypt.hash('Rider@123', 12),
      role:          'rider',
      status:        'active',
      gender:        'male',
      bio:           'Experienced driver. Love road trips and good music 🎵',
      rating:        4.8,
      emailVerified: true,
      phoneVerified: true,
      isVerified:    true,
    }));
    console.log('✅ Demo rider: rider@rydo.app / Rider@123');
  } else { rider = riderExists; }

  // Seed demo passenger
  const passengerExists = await userRepo.findOne({ where: { email: 'passenger@rydo.app' } });
  if (!passengerExists) {
    await userRepo.save(userRepo.create({
      name:          'Priya Singh',
      email:         'passenger@rydo.app',
      phone:         '+919222222222',
      passwordHash:  await bcrypt.hash('Passenger@123', 12),
      role:          'passenger',
      status:        'active',
      gender:        'female',
      rating:        4.6,
      emailVerified: true,
      phoneVerified: true,
      isVerified:    true,
    }));
    console.log('✅ Demo passenger: passenger@rydo.app / Passenger@123');
  }

  // Seed vehicle
  const vehicleExists = await vehicleRepo.findOne({ where: { registrationNumber: 'MH12AB1234' } });
  let vehicle: any;
  if (!vehicleExists && rider) {
    vehicle = await vehicleRepo.save(vehicleRepo.create({
      userId:             rider.id,
      type:               'car',
      brand:              'Maruti',
      model:              'Swift',
      color:              'White',
      registrationNumber: 'MH12AB1234',
      seatCapacity:       4,
    }));
    console.log('✅ Demo vehicle seeded');
  }

  // Seed sample rides
  const rideCount = await rideRepo.count();
  if (rideCount === 0 && rider) {
    const sampleRides = [
      { pickupLocation: 'Mumbai Central', dropLocation: 'Pune Station', pickupLat: 18.9696, pickupLng: 72.8194, dropLat: 18.5204, dropLng: 73.8567, pricePerSeat: 350, availableSeats: 3 },
      { pickupLocation: 'Bandra West',    dropLocation: 'Lonavala',     pickupLat: 19.0596, pickupLng: 72.8295, dropLat: 18.7546, dropLng: 73.4062, pricePerSeat: 250, availableSeats: 2 },
      { pickupLocation: 'Andheri East',   dropLocation: 'Nashik',       pickupLat: 19.1136, pickupLng: 72.8697, dropLat: 19.9975, dropLng: 73.7898, pricePerSeat: 450, availableSeats: 4 },
    ];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const rideDate = tomorrow.toISOString().split('T')[0];

    for (const rd of sampleRides) {
      await rideRepo.save(rideRepo.create({
        ...rd,
        riderId:      rider.id,
        vehicleId:    vehicle?.id,
        rideDate,
        rideTime:     '07:00:00',
        status:       'scheduled',
        acAvailable:  true,
        musicAllowed: true,
        luggageAllowed: true,
      }));
    }
    console.log('✅ 3 sample rides seeded');
  }

  await AppDataSource.destroy();
  console.log('\n🎉 Seed complete!\n');
  console.log('Demo accounts:');
  console.log('  Admin:     admin@rydo.app     / Admin@123');
  console.log('  Rider:     rider@rydo.app     / Rider@123');
  console.log('  Passenger: passenger@rydo.app / Passenger@123\n');
}

seed().catch(e => { console.error('Seed failed:', e); process.exit(1); });
