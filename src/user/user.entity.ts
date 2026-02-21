import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string; // Optional if using OAuth, but required for local auth

  @Column({ default: false })
  isLifetimeMember: boolean;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  subscriptionStatus: string;

  @Column({ nullable: true, type: 'text' })
  openaiKey: string;

  @Column({ nullable: true, type: 'text' })
  googleKey: string;

  @Column({ nullable: true, type: 'text' })
  anthropicKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
