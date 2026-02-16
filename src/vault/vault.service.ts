import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vault } from './vault.entity';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VaultService {
    private readonly algorithm = 'aes-256-cbc';
    private key: Buffer;

    constructor(
        @InjectRepository(Vault)
        private vaultRepository: Repository<Vault>,
        private configService: ConfigService,
    ) {
        const secret = this.configService.get<string>('JWT_SECRET') || 'default_secret_key_needs_replacement';
        // Use scrypt to generate a 32-byte key from the secret
        this.key = crypto.scryptSync(secret, 'salt', 32);
    }

    encrypt(text: string): { encryptedData: string; iv: string } {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { encryptedData: encrypted, iv: iv.toString('hex') };
    }

    decrypt(text: string, iv: string): string {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    create(name: string, content: string, ownerId: string): Promise<Vault> {
        const { encryptedData, iv } = this.encrypt(content);
        const secret = this.vaultRepository.create({
            name,
            encryptedContent: encryptedData,
            iv: iv,
            ownerId,
        });
        return this.vaultRepository.save(secret);
    }

    async findOne(id: string): Promise<Vault | null> {
        return this.vaultRepository.findOneBy({ id });
    }

    async getDecryptedContent(id: string): Promise<string | null> {
        const secret = await this.vaultRepository.findOneBy({ id });
        if (!secret) return null;
        return this.decrypt(secret.encryptedContent, secret.iv);
    }
}
