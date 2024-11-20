/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const register_result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]
    );
    const registered_user = register_result.rows[0];
    return {
      username: registered_user.username,
      password: registered_user.password,
      first_name: registered_user.first_name,
      last_name: registered_user.last_name,
      phone: registered_user.phone
    };
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;