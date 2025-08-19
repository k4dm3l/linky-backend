export class LinkUrlEmptyException extends Error {
  constructor() {
    super("URL must be a non-empty string");
    this.name = "LinkUrlEmptyException";
  }
}

export class LinkUrlInvalidProtocolException extends Error {
  constructor() {
    super("URL must use HTTP or HTTPS protocol");
    this.name = "LinkUrlInvalidProtocolException";
  }
}

export class LinkUrlInvalidException extends Error {
  constructor() {
    super("URL must be a valid URL");
    this.name = "LinkUrlInvalidException";
  }
}

export class LinkIdEmptyException extends Error {
  constructor() {
    super("Link ID must be a non-empty string");
    this.name = "LinkIdEmptyException";
  }
}

export class LinkCodeEmptyException extends Error {
  constructor() {
    super("Link code must be a non-empty string");
    this.name = "LinkCodeEmptyException";
  }
}

export class LinkCodeInvalidLengthException extends Error {
  constructor(codeLength: number) {
    super(`Link code must be ${codeLength} characters long`);
    this.name = "LinkCodeInvalidLengthException";
  }
}

export class LinkCodeInvalidCharactersException extends Error {
  constructor() {
    super("Link code must contain only uppercase letters and numbers");
    this.name = "LinkCodeInvalidCharactersException";
  }
}

