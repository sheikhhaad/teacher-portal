import React from "react";
import StateMessage from "./StateMessage";

export default function Error({
  message = "Something went wrong. Please try again.",
  onRetry,
  className = "",
}) {
  return (
    <StateMessage
      title="Error"
      description={message}
      variant="error"
      actionLabel={onRetry ? "Try Again" : null}
      onAction={onRetry}
      className={className}
    />
  );
}
