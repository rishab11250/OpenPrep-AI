const errorHandler = require('../../middleware/error');

describe('Error Handler Middleware', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      statusCode: null,
      body: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.body = data;
        return this;
      },
    };
  });

  it('should return 500 for a generic error', () => {
    const err = new Error('Something went wrong');
    errorHandler(err, req, res, vi.fn());

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: 'Something went wrong',
    });
  });

  it('should return 404 for a CastError (Mongoose bad ObjectId)', () => {
    const err = new Error('Resource not found');
    err.name = 'CastError';
    errorHandler(err, req, res, vi.fn());

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: 'Resource not found',
    });
  });

  it('should return 400 for a duplicate key error (code 11000)', () => {
    const err = new Error('Duplicate field value entered');
    err.code = 11000;
    errorHandler(err, req, res, vi.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: 'Duplicate field value entered',
    });
  });

  it('should return 400 for a Mongoose ValidationError', () => {
    const err = new Error('Please add a name, Please add an email');
    err.name = 'ValidationError';
    err.errors = {
      name: { message: 'Please add a name' },
      email: { message: 'Please add an email' },
    };
    errorHandler(err, req, res, vi.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: 'Please add a name, Please add an email',
    });
  });

  it('should preserve an existing statusCode if set on the error', () => {
    const err = new Error('Custom error');
    err.statusCode = 429;
    errorHandler(err, req, res, vi.fn());

    expect(res.statusCode).toBe(429);
    expect(res.body).toEqual({
      success: false,
      error: 'Custom error',
    });
  });

  it('should return 500 if error has no message', () => {
    const err = new Error();
    errorHandler(err, req, res, vi.fn());

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: 'Server Error',
    });
  });
});
