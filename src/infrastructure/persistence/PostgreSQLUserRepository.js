/**
 * PostgreSQL User Repository Implementation - Infrastructure Layer
 * Implementa el contrato UserRepository usando PostgreSQL
 */

import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { User } from '../../domain/entities/User.js';
import pool from '../database/connection.js';

export class PostgreSQLUserRepository extends UserRepository {
  
  async findById(user_id) {
    try {
      const query = `
        SELECT user_id, identification, email, password_hash, name, phone, address, 
               type_user, account_status, created_at, updated_at
        FROM users 
        WHERE user_id = $1 AND account_status = 'active'
      `;
      const result = await pool.query(query, [user_id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const query = `
        SELECT user_id, identification, email, password_hash, name, phone, address, 
               type_user, account_status, created_at, updated_at
        FROM users 
        WHERE email = $1
      `;
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByIdentification(identification) {
    try {
      const query = `
        SELECT user_id, identification, email, password_hash, name, phone, address, 
               type_user, account_status, created_at, updated_at
        FROM users 
        WHERE identification = $1
      `;
      const result = await pool.query(query, [identification]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by identification:', error);
      throw error;
    }
  }

  async save(user) {
    try {
      const query = `
        INSERT INTO users (user_id, identification, email, password_hash, name, phone, address, type_user, account_status, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING user_id, identification, email, name, phone, address, type_user, account_status, created_at, updated_at
      `;
      
      const values = [
        user.user_id,
        user.identification,
        user.email,
        user.password_hash,
        user.name,
        user.phone,
        user.address,
        user.type_user,
        user.account_status,
        user.created_at,
        user.updated_at
      ];
      
      const result = await pool.query(query, values);
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async update(user) {
    try {
      const query = `
        UPDATE users 
        SET identification = $2, email = $3, password_hash = $4, name = $5, 
            phone = $6, address = $7, type_user = $8, account_status = $9, updated_at = $10
        WHERE user_id = $1
        RETURNING user_id, identification, email, name, phone, address, type_user, account_status, created_at, updated_at
      `;
      
      const values = [
        user.user_id,
        user.identification,
        user.email,
        user.password_hash,
        user.name,
        user.phone,
        user.address,
        user.type_user,
        user.account_status,
        user.updated_at
      ];
      
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(user_id) {
    try {
      const query = `
        UPDATE users 
        SET account_status = 'suspended', updated_at = NOW()
        WHERE user_id = $1
      `;
      await pool.query(query, [user_id]);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async existsByEmail(email) {
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking if email exists:', error);
      throw error;
    }
  }

  async existsByIdentification(identification) {
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE identification = $1';
      const result = await pool.query(query, [identification]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking if identification exists:', error);
      throw error;
    }
  }

  async updateLastLogin(user_id) {
    try {
      const query = 'UPDATE users SET updated_at = NOW() WHERE user_id = $1';
      await pool.query(query, [user_id]);
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  async updateProfile(user_id, profileData) {
    try {
      const { name, phone, address } = profileData;
      const query = `
        UPDATE users 
        SET name = COALESCE($1, name), phone = COALESCE($2, phone), address = COALESCE($3, address), updated_at = NOW()
        WHERE user_id = $4 AND account_status = 'active'
        RETURNING user_id, identification, email, name, phone, address, type_user, account_status, created_at, updated_at
      `;
      const result = await pool.query(query, [name, phone, address, user_id]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}