/**
 * User Entity - Domain Layer
 * Representa un usuario en el sistema con toda su lógica de negocio
 */

import { v4 as uuidv4 } from 'uuid';

export class User {
  constructor({
    user_id,
    identification,
    email,
    password_hash,
    name,
    phone,
    address,
    type_user = 'student',
    account_status = 'active',
    created_at,
    updated_at
  }) {
    this.user_id = user_id || uuidv4();
    this.identification = identification;
    this.email = email;
    this.password_hash = password_hash;
    this.name = name;
    this.phone = phone;
    this.address = address;
    this.type_user = type_user;
    this.account_status = account_status;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  // Métodos de negocio
  isActive() {
    return this.account_status === 'active';
  }

  isAdmin() {
    return this.type_user === 'admin';
  }

  isInstructor() {
    return this.type_user === 'instructor';
  }

  isStudent() {
    return this.type_user === 'student';
  }

  suspend() {
    this.account_status = 'suspended';
    this.updated_at = new Date();
  }

  activate() {
    this.account_status = 'active';
    this.updated_at = new Date();
  }

  updateProfile({ name, phone, address }) {
    if (name) this.name = name;
    if (phone) this.phone = phone;
    if (address) this.address = address;
    this.updated_at = new Date();
  }

  updateName(name) {
    this.name = name;
    this.updated_at = new Date();
  }

  updateEmail(email) {
    this.email = email;
    this.updated_at = new Date();
  }

  updatePhone(phone) {
    this.phone = phone;
    this.updated_at = new Date();
  }

  updateAddress(address) {
    this.address = address;
    this.updated_at = new Date();
  }

  updatePasswordHash(passwordHash) {
    this.password_hash = passwordHash;
    this.updated_at = new Date();
  }

  updateLastLogin() {
    this.updated_at = new Date();
  }

  // Validaciones de dominio
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // Mínimo 8 caracteres, al menos una letra y un número
    return password && password.length >= 8;
  }

  // Método para serializar datos públicos (sin password)
  toPublicData() {
    return {
      user_id: this.user_id,
      identification: this.identification,
      email: this.email,
      name: this.name,
      phone: this.phone,
      address: this.address,
      type_user: this.type_user,
      account_status: this.account_status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}