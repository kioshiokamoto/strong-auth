import { Exclude } from 'class-transformer';
import { IsEmail, Length } from 'class-validator';
import { BeforeInsert, Column, Entity as TOEntity, Index } from 'typeorm';
import * as bcrypt from 'bcrypt';
import Entity from './base.entity';

@TOEntity('user')
export default class User extends Entity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Index({ unique: true })
  @IsEmail(undefined, {
    message: 'Debe ser una dirección de correo electrónico válida',
  })
  @Length(1, 255, { message: 'El correo electrónico está vacío' })
  @Column()
  email: string;

  @Index()
  @Length(3, 255, { message: 'Debe tener al menos 3 caracteres' })
  @Column()
  names: string;

  @Exclude()
  @Column()
  @Length(6, 255, { message: 'Debe tener al menos 6 caracteres' })
  password: string;

  @Column({
    default:
      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
  })
  avatar: string;

  @Column({
    default: false,
  })
  is_enabled: boolean;

  @BeforeInsert()
  async hasPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
