/** User class for message.ly */

const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");
const ExpressError = require("../expressError");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashed_password = await bcrypt.hash(password, 1);
    const register_result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashed_password, first_name, last_name, phone]
    );
    return register_result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const user_result = await db.query(`SELECT username, password FROM users WHERE username = $1`, [username]);
    if (user_result.rows.length === 0) {
      throw new ExpressError(`User with username of ${username} not found`, 404);
    }
    const user = user_result.rows[0];
    return (await bcrypt.compare(password, user.password));
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const user_result = await db.query(`UPDATE users SET last_login_at = current_timestamp RETURNING last_login_at`);
    if (user_result.rows.length === 0) {
      throw new ExpressError(`User with username of ${username} not found`, 404);
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const all_users_results = await db.query(`SELECT username, first_name, last_name, phone FROM users`);
    return all_users_results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const user_result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`,
      [username]
    );
    if (user_result.rows.length === 0) {
      throw new ExpressError(`User with username of ${username} not found`, 404);
    }
    return user_result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              to_users.username AS to_username,
              to_users.first_name AS to_first_name,
              to_users.last_name AS to_last_name,
              to_users.phone AS to_phone
      FROM messages as m
        JOIN users AS from_user ON m.from_username = from_user.username
        JOIN users AS to_users ON m.to_username = to_users.username
      WHERE m.from_username = $1`,
      [username]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`User with username ${username} not found`, 404);
    }
    return results.rows.map((m) => {
      return {
        id: m.id,
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
        to_user: {
          username: m.to_username,
          first_name: m.to_first_name,
          last_name: m.to_last_name,
          phone: m.to_phone
        }
      }
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              from_users.username AS from_username,
              from_users.first_name AS from_first_name,
              from_users.last_name AS from_last_name,
              from_users.phone AS from_phone
      FROM messages as m
        JOIN users AS to_user ON m.to_username = to_user.username
        JOIN users AS from_users ON m.from_username = from_users.username
      WHERE m.to_username = $1`,
      [username]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`User with username ${username} not found`, 404);
    }
    return results.rows.map((m) => {
      return {
        id: m.id,
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
        from_user: {
          username: m.from_username,
          first_name: m.from_first_name,
          last_name: m.from_last_name,
          phone: m.from_phone
        }
      }
    });
  }
}


module.exports = User;