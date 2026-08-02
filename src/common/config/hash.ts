import * as argon from 'argon2';

export default async function hashPassword(password: string) {
  return await argon.hash(password);
}
