import { THRESHOLDS, COLORS } from "../config/constants";

/**
 * Returns 'green', 'yellow', or 'red' based on value and threshold config.
 * @param {number} value - The metric value
 * @param {'connectionRate'|'dropRate'|'firstAttempt'|'claimCompletion'|'transcriptionQueue'|'transcriptionP90'|'capacity'|'errorRate'} metricType
 * @returns {'green'|'yellow'|'red'}
 */
export function getThresholdColor(value, metricType) {
  if (value == null) return "neutral";

  switch (metricType) {
    case "connectionRate":
      if (value >= THRESHOLDS.CONNECTION_RATE.green) return "green";
      if (value >= THRESHOLDS.CONNECTION_RATE.yellow) return "yellow";
      return "red";

    case "dropRate":
    case "errorRate":
      if (value > THRESHOLDS.DROP_RATE.warning) return "red";
      if (value > THRESHOLDS.DROP_RATE.warning / 2) return "yellow";
      return "green";

    case "firstAttempt":
      if (value >= THRESHOLDS.FIRST_ATTEMPT.warning) return "green";
      if (value >= THRESHOLDS.FIRST_ATTEMPT.warning - 5) return "yellow";
      return "red";

    case "claimCompletion":
      if (value >= THRESHOLDS.CLAIM_COMPLETION.warning) return "green";
      if (value >= THRESHOLDS.CLAIM_COMPLETION.warning - 5) return "yellow";
      return "red";

    case "transcriptionQueue":
      if (value <= THRESHOLDS.TRANSCRIPTION_QUEUE.warning * 0.5) return "green";
      if (value <= THRESHOLDS.TRANSCRIPTION_QUEUE.warning) return "yellow";
      return "red";

    case "transcriptionP90":
      if (value <= THRESHOLDS.TRANSCRIPTION_P90.warning * 0.7) return "green";
      if (value <= THRESHOLDS.TRANSCRIPTION_P90.warning) return "yellow";
      return "red";

    case "capacity":
      if (value <= THRESHOLDS.CAPACITY.warning * 0.7) return "green";
      if (value <= THRESHOLDS.CAPACITY.warning) return "yellow";
      return "red";

    default:
      return "neutral";
  }
}

/**
 * Maps threshold color names to hex values
 */
export function getThresholdHex(colorName) {
  const map = {
    green: COLORS.success,
    yellow: COLORS.warning,
    red: COLORS.danger,
    neutral: COLORS.neutral,
  };
  return map[colorName] || COLORS.neutral;
}
