import { Workspace } from "@prisma/client";

const avatarText = (user: any): string => {
  if (user) {
    if (user.firstName && user.lastName) {
      if (user.firstName.length > 0 && user.lastName.length > 0) {
        return (user.firstName[0] + user.lastName[0]).toUpperCase();
      } else if (user.firstName.length > 1) {
        return user.firstName.substring(0, 2).toUpperCase();
      } else if (user.email.length > 1) {
        return user.email.substring(0, 2).toUpperCase();
      }
    } else if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
  }
  return "--";
};

function getWorkspacePrefix(item: Workspace) {
  const words = item.name.split(" ");
  if (words.length > 1) {
    return (words[0].substring(0, 1) + words[1].substring(0, 1)).toUpperCase();
  }
  if (item.name.length > 1) {
    return item.name.substring(0, 2).toUpperCase();
  }
  return item.name.substring(0, 1).toUpperCase();
}

const profileName = (user: any): string => {
  if (user) {
    if (user.firstName && user.lastName) {
      return user.firstName + " " + user.lastName;
    } else {
      return user.email;
    }
  }
  return "--";
};

const validateEmail = (email: unknown) => {
  const regexp = new RegExp(
    // eslint-disable no-useless-escape
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (typeof email !== "string" || email.length < 5 || !regexp.test(email)) {
    return `Invalid email`;
  }
};

const validatePassword = (password: unknown) => {
  if (typeof password !== "string" || password.length < 4) {
    return `Passwords must be at least 4 characters long`;
  }
};

const validatePasswords = (password?: string, passwordConfirm?: string) => {
  if (!password || !passwordConfirm) {
    return "Password required";
  }
  if (password !== passwordConfirm) {
    return "Passwords don't match";
  }
};

export default {
  avatarText,
  profileName,
  validateEmail,
  validatePassword,
  validatePasswords,
  getWorkspacePrefix,
};
