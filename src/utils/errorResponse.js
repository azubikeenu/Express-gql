export default class ErrorResponse{
  constructor(success ,message,code) {
    this.error = message;
    this.code = code;
    this.success = success;
  }
}
