const path = require('path');
const fs = require('fs');

// We test the multer configuration by checking the exported object's properties
describe('Upload Middleware', () => {
  let upload;

  beforeAll(() => {
    // Clear any existing GEMINI_API_KEY to ensure clean state
    delete process.env.GEMINI_API_KEY;
    upload = require('../../middleware/upload');
  });

  it('should export a multer instance', () => {
    expect(upload).toBeDefined();
    expect(typeof upload).toBe('object');
  });

  it('should have a single method for handling file uploads', () => {
    expect(typeof upload.single).toBe('function');
  });

  it('should have a fields method for multiple file uploads', () => {
    expect(typeof upload.fields).toBe('function');
  });

  it('should have an array method', () => {
    expect(typeof upload.array).toBe('function');
  });

  it('should have a any method', () => {
    expect(typeof upload.any).toBe('function');
  });
});
