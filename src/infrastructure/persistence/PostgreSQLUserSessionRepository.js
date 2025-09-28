/**
 * PostgreSQL UserSession Repository Implementation - Infrastructure Layer
 * Implementa el contrato UserSessionRepository usando PostgreSQL
 */

import { UserSessionRepository } from '../../domain/repositories/UserSessionRepository.js';
import { UserSession } from '../../domain/entities/UserSession.js';
import pool from '../database/connection.js';

export class PostgreSQLUserSessionRepository extends UserSessionRepository {
  
  async findByTokenHash(jwt_token_hash) {
    try {
      const query = `
        SELECT session_id, user_id, jwt_token_hash, created_at, expires_at, is_active
        FROM user_sessions 
        WHERE jwt_token_hash = $1
      `;
      const result = await pool.query(query, [jwt_token_hash]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new UserSession(result.rows[0]);
    } catch (error) {
      console.error('Error finding session by token hash:', error);
      throw error;
    }
  }

  async findActiveByTokenHash(jwt_token_hash) {
    try {
      const query = `
        SELECT session_id, user_id, jwt_token_hash, created_at, expires_at, is_active
        FROM user_sessions 
        WHERE jwt_token_hash = $1 
          AND is_active = true 
          AND expires_at > NOW()
        LIMIT 1
      `;
      const result = await pool.query(query, [jwt_token_hash]);

      if (result.rows.length === 0) {
        return null;
      }

      return new UserSession(result.rows[0]);
    } catch (error) {
      console.error('Error finding active session by token hash:', error);
      throw error;
    }
  }

  async findByUserIdAndTokenHash(user_id, jwt_token_hash) {
    try {
      const query = `
        SELECT session_id, user_id, jwt_token_hash, created_at, expires_at, is_active
        FROM user_sessions 
        WHERE user_id = $1 
          AND jwt_token_hash = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const result = await pool.query(query, [user_id, jwt_token_hash]);

      if (result.rows.length === 0) {
        return null;
      }

      return new UserSession(result.rows[0]);
    } catch (error) {
      console.error('Error finding session by user id and token hash:', error);
      throw error;
    }
  }

  async findActiveSessionsByUserId(user_id) {
    try {
      const query = `
        SELECT session_id, user_id, jwt_token_hash, created_at, expires_at, is_active
        FROM user_sessions 
        WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [user_id]);
      
      return result.rows.map(row => new UserSession(row));
    } catch (error) {
      console.error('Error finding active sessions by user ID:', error);
      throw error;
    }
  }

  async save(userSession) {
    try {
      const query = `
        INSERT INTO user_sessions (session_id, user_id, jwt_token_hash, created_at, expires_at, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING session_id, user_id, jwt_token_hash, created_at, expires_at, is_active
      `;
      
      const values = [
        userSession.session_id,
        userSession.user_id,
        userSession.jwt_token_hash,
        userSession.created_at,
        userSession.expires_at,
        userSession.is_active
      ];
      
      const result = await pool.query(query, values);
      return new UserSession(result.rows[0]);
    } catch (error) {
      console.error('Error saving user session:', error);
      throw error;
    }
  }

  async update(userSession) {
    try {
      const query = `
        UPDATE user_sessions 
        SET expires_at = $2, is_active = $3
        WHERE session_id = $1
        RETURNING session_id, user_id, jwt_token_hash, created_at, expires_at, is_active
      `;
      
      const values = [
        userSession.session_id,
        userSession.expires_at,
        userSession.is_active
      ];
      
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? new UserSession(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating user session:', error);
      throw error;
    }
  }

  async invalidateByTokenHash(jwt_token_hash) {
    try {
      const query = `
        UPDATE user_sessions 
        SET is_active = false 
        WHERE jwt_token_hash = $1
      `;
      await pool.query(query, [jwt_token_hash]);
    } catch (error) {
      console.error('Error invalidating session by token hash:', error);
      throw error;
    }
  }

  async invalidateAllByUserId(user_id) {
    try {
      const query = `
        UPDATE user_sessions 
        SET is_active = false 
        WHERE user_id = $1
      `;
      const result = await pool.query(query, [user_id]);
      return result.rowCount;
    } catch (error) {
      console.error('Error invalidating all sessions by user ID:', error);
      throw error;
    }
  }

  async cleanExpiredSessions() {
    try {
      const query = `
        DELETE FROM user_sessions 
        WHERE expires_at < NOW() OR is_active = false
      `;
      const result = await pool.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
      throw error;
    }
  }

  async validateSession(jwt_token_hash) {
    try {
      const query = `
        SELECT s.session_id, s.user_id, s.jwt_token_hash, s.created_at, s.expires_at, s.is_active,
               u.email, u.name, u.type_user, u.account_status
        FROM user_sessions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.jwt_token_hash = $1 
          AND s.is_active = true 
          AND s.expires_at > NOW()
          AND u.account_status = 'active'
      `;
      
      const result = await pool.query(query, [jwt_token_hash]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      const session = new UserSession({
        session_id: row.session_id,
        user_id: row.user_id,
        jwt_token_hash: row.jwt_token_hash,
        created_at: row.created_at,
        expires_at: row.expires_at,
        is_active: row.is_active
      });
      
      // Agregar datos del usuario para validación
      session.userData = {
        email: row.email,
        name: row.name,
        type_user: row.type_user,
        account_status: row.account_status
      };
      
      return session;
    } catch (error) {
      console.error('Error validating session:', error);
      throw error;
    }
  }

  async countActiveSessionsByUserId(user_id) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_sessions 
        WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
      `;
      const result = await pool.query(query, [user_id]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting active sessions:', error);
      throw error;
    }
  }
}
