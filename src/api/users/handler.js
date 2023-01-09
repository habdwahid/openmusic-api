class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postUserHandler(request, h) {
    // Validating request
    this._validator.validateUserPayload(request.payload);

    const { username, password, fullname } = request.payload;

    const id = await this._service.addUser({ username, password, fullname });

    // Response
    const res = h.response({
      status: 'success',
      data: {
        userId: id,
      },
    });

    res.code(201);
    return res;
  }
}

module.exports = UsersHandler;
