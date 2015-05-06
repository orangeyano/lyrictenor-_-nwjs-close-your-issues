import {BaseError} from "make-error";

export default class AppError extends BaseError {
  constructor (message) {
    super(message);
  }
}
