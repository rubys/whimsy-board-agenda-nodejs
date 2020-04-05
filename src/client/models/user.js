import { Server } from "../utils.js";

//
// Convenience access to user information (currently residing off of the
// Server.pending data structure).
//
class User {
  static get id() {
    return Server.pending.userid
  };

  static get initials() {
    return Server.pending.initials
  };

  static get firstname() {
    return Server.pending.firstname
  };

  static get username() {
    return Server.pending.username
  };

  static get role() {
    if (Server.role) {
      return Server.role
    } else if (Server.pending && Server.pending.role) {
      return Server.pending.role
    } else {
      return "guest"
    }
  };

  static set role(role) {
    Server.role = role
  }
};

export default User