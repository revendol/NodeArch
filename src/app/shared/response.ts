import ErrorMessage from "./errorMessage";

export function success(message: string, data: unknown) {
  const response = {
    success: true,
    message: message,
    data: "" as unknown,
  };

  response.data =
    Array.isArray(data) || typeof data === "object"
      ? data
      : {status: Number.isInteger(data) ? true : data};

  return response;
}

interface FailureParams {
  message: unknown;
  errors?: unknown;
}

export function failure(message: FailureParams) {
  const response = {
    success: false,
    data : {
      message: message.message??ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
      errors: message.errors
    }
  };
  return response;
}