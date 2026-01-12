export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status: err.status || "error",
      message: err.message,
      stack: err.stack,
    });
  }

  // Production
  return res.status(statusCode).json({
    status: err.status || "error",
    message: err.isOperational
      ? err.message
      : "Something went wrong. Please try again later.",
  });
};
